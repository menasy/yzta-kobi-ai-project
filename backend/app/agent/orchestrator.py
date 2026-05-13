# agent/orchestrator.py
# Ana agent döngüsü — ReAct pattern.
# LLM → tool_call → execute → LLM → final yanıt
# HTTP request/response bilmez. Sadece mesaj alır, yanıt üretir.

import asyncio

import re
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .context import AgentContext

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.exceptions import ExternalServiceError
from app.core.logger import get_logger

from .memory import ConversationMemory
from .prompts import SYSTEM_PROMPT
from .tools import ToolRegistry, ToolResult
from .tools.cargo_tools import GetCargoStatusTool
from .tools.inventory_tools import CheckProductStockTool, GetLowStockReportTool
from .tools.order_tools import GetOrderStatusTool, GetOrdersByPhoneTool

from app.services.stock_analysis_service import StockAnalysisService

from .tools.inventory_tools import CheckProductStockTool, GetLowStockReportTool, GetStockPredictionTool

logger = get_logger(__name__)

# Sonsuz döngü önlemi — maksimum tool çağrı iterasyonu
_MAX_ITERATIONS = 5


class AgentOrchestrator:
    """
    AI Agent orchestrator — projenin kalbi.

    ReAct döngüsü:
        1. Redis'ten konuşma geçmişini yükle
        2. LLM'e system prompt + geçmiş + tool tanımları ile gönder
        3. LLM tool çağırırsa → tool'u çalıştır → sonucu LLM'e geri gönder
        4. LLM final yanıt üretene kadar tekrarla (max N iterasyon)
        5. Konuşma geçmişini Redis'e kaydet
        6. Final yanıtı döndür

    HTTP request/response bilmez.
    DB session dependency injection ile alır.
    """

    def __init__(self, db: AsyncSession, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._memory = ConversationMemory()
        self._db = db
        self._client = genai.Client(api_key=self._settings.GEMINI_API_KEY)

    def _build_registry(self, context: "AgentContext") -> ToolRegistry:
        """Tool'arı role göre oluşturup registry'ye kaydeder."""
        registry = ToolRegistry()

        # Herkesin erişebildiği temel araçlar
        registry.register(GetOrderStatusTool(self._db))
        registry.register(GetCargoStatusTool(self._db))
        registry.register(CheckProductStockTool(self._db))

        # Sadece Admin'in erişebildiği operasyonel araçlar
        if context.role == "admin":
            registry.register(GetOrdersByPhoneTool(self._db))
            registry.register(GetLowStockReportTool(self._db))
            registry.register(GetStockPredictionTool(self._db))

        return registry

    def _build_config(self, registry: ToolRegistry) -> types.GenerateContentConfig:
        """LLM çağrısı için config oluşturur (system prompt + tools)."""
        declarations = registry.get_function_declarations()
        tools = types.Tool(function_declarations=declarations) if declarations else None

        return types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[tools] if tools else None,
        )

    def _build_contents(
        self,
        history: list[dict[str, str]],
        user_message: str,
    ) -> list[types.Content]:
        """Konuşma geçmişi + yeni mesajı Gemini contents formatına çevirir."""
        contents: list[types.Content] = []

        # Geçmiş mesajları ekle
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg["content"])],
                )
            )

        # Yeni kullanıcı mesajını ekle
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text=user_message)],
            )
        )

        return contents

    async def run(self, message: str, context: "AgentContext") -> str:
        """
        Agent'ı çalıştırır.

        Args:
            message: Kullanıcı mesajı.
            context: Güvenlik ve sahiplik bilgilerini içeren AgentContext.

        Returns:
            LLM'in ürettiği final Türkçe yanıt.
        """
        # 1. Konuşma geçmişini yükle (user-scoped)
        history = await self._memory.load_for_user(context.session_id, context.user_id)

        # 2. Registry ve Config oluştur (Role bazlı)
        registry = self._build_registry(context)
        config = self._build_config(registry)
        
        # 3. İçerikleri oluştur
        contents = self._build_contents(history, message)

        # 4. ReAct döngüsü
        final_text = await self._react_loop(contents, config, registry, context)

        # 5. Konuşma geçmişini güncelle
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": final_text})
        await self._memory.save_for_user(context.session_id, context.user_id, history)

        return final_text

    async def _react_loop(
        self,
        contents: list[types.Content],
        config: types.GenerateContentConfig,
        registry: ToolRegistry,
        context: "AgentContext",
    ) -> str:
        """
        ReAct döngüsü: LLM çağır → tool varsa çalıştır → sonucu geri ver → tekrarla.
        Max _MAX_ITERATIONS iterasyon güvenliği var.
        """
        for iteration in range(1, _MAX_ITERATIONS + 1):
            logger.debug("ReAct iterasyon %d/%d", iteration, _MAX_ITERATIONS)

            # LLM çağrısı (async)
            try:
                response = await self._client.aio.models.generate_content(
                    model=self._settings.LLM_MODEL,
                    contents=contents,
                    config=config,
                )
            except genai_errors.APIError as exc:
                error_text = str(exc)
                if self._is_rate_limit_error(error_text):
                    logger.warning(
                        "Gemini kota limiti aşıldı, degradeli yanıt döndürülüyor: %s",
                        error_text,
                    )
                    return self._build_rate_limit_reply(error_text)

                logger.error("Gemini API hatası: %s", error_text)
                raise ExternalServiceError(
                    message="AI sağlayıcısı şu anda yanıt veremiyor. Lütfen tekrar deneyin.",
                )
            except Exception as exc:
                logger.error("Beklenmeyen LLM hatası: %s", str(exc), exc_info=True)
                raise ExternalServiceError(
                    message="AI sağlayıcısına erişilemiyor. Lütfen biraz sonra tekrar deneyin.",
                )

            # Yanıtı kontrol et
            logger.debug("LLM Yanıtı: %s", str(response))
            if not response.candidates:
                logger.warning("LLM boş yanıt döndü.")
                return "Üzgünüm, şu anda yanıt üretemiyorum. Lütfen tekrar deneyin."

            candidate = response.candidates[0]

            # Function call var mı kontrol et
            function_call = self._extract_function_call(candidate)

            if function_call is None:
                # Final text yanıtı
                return self._extract_text(candidate)

            # Tool çalıştır
            tool_name = function_call.name
            tool_args = dict(function_call.args) if function_call.args else {}
            tool_id = getattr(function_call, "id", None)

            logger.info(
                "Tool çağrılıyor: %s (args=%s, iteration=%d)",
                tool_name,
                list(tool_args.keys()),
                iteration,
            )

            result = await registry.execute(tool_name, context=context, **tool_args)

            # Model yanıtını ve tool sonucunu contents'e ekle
            contents.append(candidate.content)

            function_response_payload = self._build_function_response_payload(
                result=result,
                tool_call_id=tool_id,
            )
            try:
                function_response_part = types.Part.from_function_response(
                    name=tool_name,
                    response=function_response_payload,
                )
            except TypeError as exc:
                logger.error(
                    "Function response format hatası: %s",
                    str(exc),
                    exc_info=True,
                )
                raise ExternalServiceError(
                    message="AI sağlayıcısı araç yanıtını işleyemedi. Lütfen tekrar deneyin.",
                )
            except Exception as exc:
                logger.error(
                    "Function response oluşturulamadı: %s",
                    str(exc),
                    exc_info=True,
                )
                raise ExternalServiceError(
                    message="AI sağlayıcısı araç yanıtını işleyemedi.",
                )
            contents.append(
                types.Content(
                    role="user",
                    parts=[function_response_part],
                )
            )

        # Maksimum iterasyona ulaşıldı
        logger.warning("Maksimum iterasyon sınırına ulaşıldı (%d).", _MAX_ITERATIONS)
        return (
            "Üzgünüm, sorgunuzu işlerken çok fazla adım gerekti. "
            "Lütfen sorunuzu daha net bir şekilde tekrar sorun veya "
            "işletme yetkilimize danışın."
        )

    @staticmethod
    def _extract_function_call(candidate: Any) -> Any | None:
        """Candidate'den function_call varsa çıkarır, yoksa None döner."""
        if not candidate.content or not candidate.content.parts:
            return None

        for part in candidate.content.parts:
            if hasattr(part, "function_call") and part.function_call:
                return part.function_call

        return None

    @staticmethod
    def _build_function_response_payload(
        result: ToolResult,
        tool_call_id: str | None,
    ) -> dict[str, Any]:
        """
        Gemini function_response payload üretir.
        SDK id alanını desteklemediği için varsa metadata içine eklenir.
        """
        try:
            payload = result.model_dump(mode="json")
        except Exception as exc:
            logger.error(
                "Tool sonucu serialize edilemedi: %s",
                str(exc),
                exc_info=True,
            )
            payload = {
                "success": result.success,
                "error": result.error,
                "data": result.to_llm_text(),
            }

        if tool_call_id:
            metadata = payload.get("metadata") if isinstance(payload, dict) else None
            payload["metadata"] = (
                {**metadata, "tool_call_id": tool_call_id}
                if isinstance(metadata, dict)
                else {"tool_call_id": tool_call_id}
            )

        return payload

    @staticmethod
    def _extract_text(candidate: Any) -> str:
        """Candidate'den text yanıtını çıkarır."""
        if not candidate.content or not candidate.content.parts:
            return "Yanıt üretilemedi."

        texts = []
        for part in candidate.content.parts:
            if hasattr(part, "text") and part.text:
                texts.append(part.text)

        return "\n".join(texts) if texts else "Yanıt üretilemedi."

    @staticmethod
    def _is_rate_limit_error(error_text: str) -> bool:
        """Error mesajının kota veya hız limiti hatası olup olmadığını kontrol eder."""
        error_text = error_text.upper()
        indicators = [
            "429",
            "QUOTA_EXHAUSTED",
            "RATE_LIMIT_EXCEEDED",
            "RESOURCE_EXHAUSTED",
        ]
        return any(indicator in error_text for indicator in indicators)

    @staticmethod
    def _build_rate_limit_reply(error_text: str) -> str:
        """Kota hatası durumunda kullanıcıya dönülecek dostane mesaj."""
        return (
            "AI servisinin kullanım limiti doldu. "
            "Lütfen kısa süre sonra tekrar deneyin."
        )
