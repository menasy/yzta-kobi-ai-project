# agent/tools/__init__.py
# ToolRegistry — tüm tool'ları merkezi olarak yönetir.
# Tool kayıt, isimle erişim, toplu schema üretimi ve güvenli çalıştırma.

from typing import Any

from app.core.logger import get_logger

from .base import BaseTool, ToolResult

logger = get_logger(__name__)

__all__ = ["BaseTool", "ToolResult", "ToolRegistry"]


class ToolRegistry:
    """
    Agent tool'larını kayıt altında tutan ve yöneten merkezi registry.

    Kullanım:
        registry = ToolRegistry()
        registry.register(GetOrderStatusTool(...))
        registry.register(CheckProductStockTool(...))

        # LLM'e gönderilecek tool tanımları
        declarations = registry.get_function_declarations()

        # Tool çalıştırma
        result = await registry.execute("get_order_status", order_id=128)
    """

    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Tool'u registry'ye ekler. Aynı isimle tekrar kayıt yapılamaz."""
        if tool.name in self._tools:
            logger.warning("Tool '%s' zaten kayıtlı, atlanıyor.", tool.name)
            return
        self._tools[tool.name] = tool
        logger.debug("Tool kayıt edildi: %s", tool.name)

    def get(self, name: str) -> BaseTool | None:
        """İsimle tool döndürür. Bulunamazsa None."""
        return self._tools.get(name)

    def list_tools(self) -> list[BaseTool]:
        """Kayıtlı tüm tool'ları döndürür."""
        return list(self._tools.values())

    def get_function_declarations(self) -> list[dict[str, Any]]:
        """
        Tüm tool'ların LLM function calling formatındaki tanımlarını döndürür.
        Gemini API'sine tools parametresi olarak gönderilir.
        """
        return [tool.to_function_declaration() for tool in self._tools.values()]

    async def execute(self, tool_name: str, **kwargs: Any) -> ToolResult:
        """
        Tool'u ismiyle güvenli şekilde çalıştırır.

        - Tool bulunamazsa hata ToolResult döner.
        - Tool çalışırken exception fırlatırsa yakalar ve güvenli ToolResult döner.
        - LLM'e her durumda anlamlı bir sonuç aktarılır.
        """
        tool = self.get(tool_name)
        if tool is None:
            logger.warning("Bilinmeyen tool çağrısı: %s", tool_name)
            return ToolResult(
                success=False,
                error=f"'{tool_name}' adında bir araç bulunamadı.",
            )

        try:
            result = await tool.execute(**kwargs)
            logger.info(
                "Tool çalıştırıldı: %s (success=%s)",
                tool_name,
                result.success,
            )
            return result
        except Exception as exc:
            logger.error(
                "Tool hatası: %s — %s",
                tool_name,
                str(exc),
                exc_info=True,
            )
            return ToolResult(
                success=False,
                error=f"Araç çalışırken bir hata oluştu: {str(exc)}",
            )
