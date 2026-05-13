# services/order_query_service.py
# Agent tool'ları için sipariş sorgulama servisi.
# Sadece read-only sorgulama yapar.
# Tool'lar bu servisi çağırır, doğrudan repository çağırmaz.

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.core.logger import get_logger
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.user_repository import UserRepository

logger = get_logger(__name__)


class OrderQueryService:
    """
    Sipariş sorgulamaya özel, read-only servis.
    Agent tool'ları tarafından kullanılır.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._order_repo = OrderRepository(db)
        self._customer_repo = CustomerRepository(db)
        self._user_repo = UserRepository(db)

    async def get_order_detail(self, order_id: int, customer_id: int | None = None) -> dict:
        """
        Sipariş detayını LLM-friendly dict olarak döndürür.
        Eğer customer_id verilmişse ve sipariş sahibinin ID'siyle eşleşmiyorsa
        (veya sipariş hiç yoksa) güvenli bir şekilde NotFoundError fırlatır.
        """
        order = await self._order_repo.get_with_items(order_id)
        if order is None:
            raise NotFoundError(message="Bu siparişi bulamadım veya bu siparişe erişim yetkiniz yok.")
            
        if customer_id is not None and order.customer_id != customer_id:
            raise NotFoundError(message="Bu siparişi bulamadım veya bu siparişe erişim yetkiniz yok.")

        return {
            "order_id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer.full_name if order.customer else "Bilinmiyor",
            "placed_at": order.placed_at.isoformat() if order.placed_at else None,
            "item_count": len(order.order_items) if order.order_items else 0,
        }

    async def get_active_orders_for_customer(self, customer_id: int, limit: int = 5) -> list[dict]:
        """
        Müşterinin sadece aktif/son siparişlerini getirir.
        'Siparişim nerede?' gibi jenerik sorular için kullanılır.
        """
        orders = await self._order_repo.get_by_customer(
            customer_id=customer_id,
            limit=limit,
        )
        
        if not orders:
            return []
            
        return [
            {
                "order_id": order.id,
                "order_number": order.order_number,
                "status": order.status,
                "total_amount": float(order.total_amount),
                "placed_at": order.placed_at.isoformat() if order.placed_at else None,
            }
            for order in orders
        ]

    async def verify_tracking_number_ownership(self, tracking_number: str, customer_id: int) -> bool:
        """
        Verilen takip numarasının bu müşterinin bir siparişine ait olup olmadığını kontrol eder.
        """
        # SQLAlchemy ile takip numarasını kullanan gönderiyi (shipment) arayıp siparişe gidebiliriz.
        # OrderQueryService'in db session'ına erişimi var.
        from sqlalchemy import select
        from app.models.shipment import Shipment
        from app.models.order import Order
        
        stmt = (
            select(Shipment)
            .join(Order, Shipment.order_id == Order.id)
            .where(Shipment.tracking_number == tracking_number)
            .where(Order.customer_id == customer_id)
        )
        
        result = await self._order_repo._db.execute(stmt)
        shipment = result.scalar_one_or_none()
        
        return shipment is not None

    async def get_orders_by_phone(self, phone: str, limit: int = 5) -> list[dict]:
        """
        Telefon numarasına göre müşterinin son siparişlerini döndürür.
        Müşteri bulunamazsa boş liste döner.
        """
        customer = await self._customer_repo.get_by_phone(phone)
        if customer is None:
            return []

        customer_user = await self._user_repo.get_by_email(f"legacy-customer-{customer.id}@placeholder.kobi.local")
        if customer_user is None and customer.email:
            customer_user = await self._user_repo.get_by_email(customer.email)
        if customer_user is None:
            return []

        orders = await self._order_repo.get_by_customer(
            customer_id=customer_user.id,
            limit=limit,
        )

        return [
            {
                "order_id": order.id,
                "order_number": order.order_number,
                "status": order.status,
                "total_amount": float(order.total_amount),
                "placed_at": order.placed_at.isoformat() if order.placed_at else None,
            }
            for order in orders
        ]
