# agent/tools/order_tools.py
# Sipariş sorgulama tool'ları.
# OrderQueryService üzerinden çalışır — doğrudan repository veya DB session kullanmaz.

from typing import TYPE_CHECKING, Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.logger import get_logger
from app.models.user import User
from app.models.user_address import UserAddress
from app.schemas.order import CustomerOrderCreate, CustomerOrderItemCreate, CustomerShippingCreate
from app.services.order_query_service import OrderQueryService
from app.services.order_service import OrderService

from .base import BaseTool, ToolResult

if TYPE_CHECKING:
    from app.agent.context import AgentContext

logger = get_logger(__name__)


class GetOrderStatusTool(BaseTool):
    """Sipariş ID'sine göre sipariş durumunu sorgular."""

    name = "get_order_status"
    description = (
        "Müşteri kendi aktif siparişlerini sorduğunda veya belirli bir "
        "sipariş ID'sine/numarasına göre siparişin durumunu sorduğunda bu aracı kullan. "
        "Eğer müşteri sipariş ID'si vermemişse, sadece aracı çağır, müşterinin "
        "aktif siparişleri listelenecektir."
    )
    parameters = {
        "type": "object",
        "properties": {
            "order_id": {
                "type": "integer",
                "description": "Sorgulanacak sipariş ID'si veya numarası. Belirtilmezse müşterinin aktif siparişleri döner.",
            },
        },
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderQueryService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        order_id: int | None = kwargs.get("order_id")
        
        # Admin olmayanlar için customer_id zorunluluğu
        customer_id = context.customer_id if context.role != "admin" else None

        if order_id is None:
            # Müşteri sipariş ID belirtmeden sordu, kendi aktif siparişlerini getir
            if customer_id is None:
                return ToolResult(success=False, error="Sipariş sorgulamak için giriş yapmalısınız.")
            
            try:
                orders = await self._service.get_active_orders_for_customer(customer_id)
                if not orders:
                    return ToolResult(success=True, data="Sipariş kaydı bulamadım.")
                return ToolResult(success=True, data=orders)
            except AppException as exc:
                return ToolResult(success=False, error=exc.message)

        try:
            order_id = int(order_id)
        except (ValueError, TypeError):
            return ToolResult(success=False, error="Geçersiz sipariş ID'si.")

        try:
            # Service seviyesinde security enforcement
            detail = await self._service.get_order_detail(order_id=order_id, customer_id=customer_id)
            return ToolResult(success=True, data=detail)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class GetOrdersByPhoneTool(BaseTool):
    """Telefon numarasına göre müşterinin son siparişlerini listeler."""

    name = "get_orders_by_phone"
    description = (
        "Verilen telefon numarasına ait müşterinin son 5 siparişini listeler. "
        "Müşteri telefon numarası ile siparişlerini sorduğunda bu aracı kullan."
    )
    parameters = {
        "type": "object",
        "properties": {
            "phone": {
                "type": "string",
                "description": "Müşterinin telefon numarası (ör: 05321234567).",
            },
        },
        "required": ["phone"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._service = OrderQueryService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        # Güvenlik kontrolü: Sadece admin bu tool'u kullanabilir
        if context.role != "admin":
            return ToolResult(success=False, error="Bu bilgiye erişim yetkiniz yok.")

        phone: str | None = kwargs.get("phone")
        if not phone:
            return ToolResult(success=False, error="Telefon numarası belirtilmedi.")

        try:
            orders = await self._service.get_orders_by_phone(phone)
            if not orders:
                return ToolResult(
                    success=True,
                    data=f"{phone} numarasına ait sipariş bulunamadı.",
                )
            return ToolResult(success=True, data=orders)
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)


class CreateCustomerOrderTool(BaseTool):
    """Müşteri için otomatik olarak yeni bir sipariş oluşturur."""

    name = "create_customer_order"
    description = (
        "Müşteri kendisi için yeni bir sipariş oluşturmak istediğinde bu aracı kullan. "
        "Seçili bir ürünün ID'sini (product_id) ve opsiyonel olarak miktarını (quantity) alarak siparişi otomatik oluşturur. "
        "Kullanıcının hesabında kayıtlı bir teslimat adresi olması gerekir."
    )
    parameters = {
        "type": "object",
        "properties": {
            "product_id": {
                "type": "integer",
                "description": "Siparişi oluşturulacak ürünün benzersiz kimlik numarası (ID).",
            },
            "quantity": {
                "type": "integer",
                "description": "Sipariş verilecek ürün adedi. Belirtilmezse varsayılan değer 1'dir.",
            },
        },
        "required": ["product_id"],
    }

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._order_service = OrderService(db)

    async def execute(self, context: "AgentContext", **kwargs: Any) -> ToolResult:
        if context.role != "customer":
            return ToolResult(success=False, error="Bu işlem sadece müşteri hesapları için geçerlidir.")

        product_id: int | None = kwargs.get("product_id")
        if product_id is None:
            return ToolResult(success=False, error="Ürün ID'si belirtilmedi.")

        try:
            quantity = int(kwargs.get("quantity") or 1)
            if quantity <= 0:
                return ToolResult(success=False, error="Sipariş adedi 0'dan büyük olmalıdır.")
        except (ValueError, TypeError):
            return ToolResult(success=False, error="Geçersiz sipariş adedi.")

        try:
            # 1. Kullanıcıyı ve adreslerini yükle
            user_id = context.user_id
            
            # Kullanıcının varsayılan veya herhangi bir adresini çek
            result = await self._db.execute(
                select(UserAddress).where(
                    UserAddress.user_id == user_id
                )
            )
            addresses = list(result.scalars().all())
            
            if not addresses:
                return ToolResult(
                    success=False,
                    error=(
                        "Hesabınızda kayıtlı bir teslimat adresi bulunamadı. "
                        "AI ile sipariş verebilmek için lütfen önce 'Hesabım' kısmından "
                        "adres ve gerekli bilgileri doldurun."
                    ),
                )

            # Öncelik default olan adreste, yoksa ilk adres
            address = next((a for a in addresses if a.is_default), addresses[0])

            # Kullanıcı nesnesini çek
            user_result = await self._db.execute(
                select(User).where(User.id == user_id)
            )
            user = user_result.scalar_one_or_none()
            if not user:
                return ToolResult(success=False, error="Müşteri hesabı bulunamadı.")

            # 2. Sipariş payload'unu hazırla
            payload = CustomerOrderCreate(
                items=[
                    CustomerOrderItemCreate(product_id=product_id, quantity=quantity)
                ],
                shipping=CustomerShippingCreate(
                    full_name=address.full_name,
                    phone=address.phone,
                    address=address.address,
                    city=address.city,
                    district=address.district,
                    postal_code=address.postal_code,
                    country=address.country,
                    note=address.note,
                ),
                notes="AI Asistan aracılığıyla otomatik oluşturulan sipariş.",
            )

            # 3. Siparişi oluştur
            order_response = await self._order_service.create_customer_order(
                current_user=user,
                payload=payload,
            )

            return ToolResult(
                success=True,
                data={
                    "message": "Siparişiniz başarıyla oluşturulmuştur.",
                    "order": order_response.model_dump(mode="json"),
                },
            )
        except AppException as exc:
            return ToolResult(success=False, error=exc.message)
        except Exception as exc:
            logger.error("Sipariş oluşturma tool hatası: %s", str(exc), exc_info=True)
            return ToolResult(success=False, error=f"Sipariş oluşturulurken bir hata oluştu: {str(exc)}")
