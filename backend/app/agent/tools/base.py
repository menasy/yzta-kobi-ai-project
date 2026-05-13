# agent/tools/base.py
# Tool sözleşmesi ve standart çıktı modeli.
# Tüm tool'lar BaseTool'dan miras alır.
# LLM, tool tanımlarını to_function_declaration() ile öğrenir.

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

from pydantic import BaseModel

if TYPE_CHECKING:
    from app.agent.context import AgentContext

from app.core.logger import get_logger

logger = get_logger(__name__)


class ToolResult(BaseModel):
    """
    Her tool çalışmasının standart çıktı modeli.

    Başarılı:  ToolResult(success=True, data={...})
    Başarısız: ToolResult(success=False, error="Sipariş bulunamadı.")
    """

    success: bool
    data: Any | None = None
    error: str | None = None

    def to_llm_text(self) -> str:
        """Tool sonucunu LLM'in anlayacağı düz metin formatına çevirir."""
        if self.success:
            return str(self.data) if self.data is not None else "İşlem başarılı."
        return f"Hata: {self.error}" if self.error else "Bilinmeyen bir hata oluştu."


class BaseTool(ABC):
    """
    Tüm agent tool'larının miras aldığı soyut sınıf.

    Alt sınıflar şunları tanımlamalıdır:
        name:        LLM bu isimle tool'u çağırır.
        description: LLM bu açıklamayı okuyarak ne yapacağını anlar.
        parameters:  Parametre şeması (JSON Schema formatında).

    Alt sınıflar şu metodu implement etmelidir:
        execute(**kwargs) -> ToolResult
    """

    name: str
    description: str
    parameters: dict[str, Any]

    @abstractmethod
    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        """Tool'un asıl işi burada yapılır."""
        ...

    def to_function_declaration(self) -> dict[str, Any]:
        """
        Gemini function calling API'sine uyumlu tool tanımı üretir.

        Dönen dict, google.genai Tool → FunctionDeclaration formatına uyar:
        {
            "name": "get_order_status",
            "description": "Sipariş durumunu sorgular.",
            "parameters": {
                "type": "object",
                "properties": { ... },
                "required": [ ... ]
            }
        }
        """
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }
