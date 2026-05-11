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

    async def get_order_detail(self, order_id: int) -> dict:
        """
        Sipariş detayını LLM-friendly dict olarak döndürür.
        Bulunamazsa NotFoundError fırlatır.
        """
        order = await self._order_repo.get_with_items(order_id)
        if order is None:
            raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")

        return {
            "order_id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer.full_name if order.customer else "Bilinmiyor",
            "placed_at": order.placed_at.isoformat() if order.placed_at else None,
            "item_count": len(order.order_items) if order.order_items else 0,
        }

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
