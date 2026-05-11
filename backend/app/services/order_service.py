# services/order_service.py
# Customer direct checkout ve admin sipariş yönetimi iş mantığı.

from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.core.logger import get_logger
from app.models.product import Product
from app.models.user import User
from app.repositories.order_repository import OrderRepository
from app.repositories.order_status_history_repository import OrderStatusHistoryRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.common import ORDER_STATUSES, validate_status
from app.schemas.order import (
    AdminOrderResponse,
    CustomerOrderCreate,
    CustomerOrderItemCreate,
    CustomerOrderResponse,
    OrderStatusUpdate,
)
from app.services.inventory_service import InventoryService

logger = get_logger(__name__)

MAX_ORDER_ITEM_QUANTITY = 10000


class OrderService:
    """Sipariş oluşturma, görüntüleme ve yönetim iş kuralları."""

    def __init__(self, db: AsyncSession) -> None:
        self._order_repo = OrderRepository(db)
        self._product_repo = ProductRepository(db)
        self._status_history_repo = OrderStatusHistoryRepository(db)
        self._inventory_service = InventoryService(db)

    async def create_customer_order(
        self,
        current_user: User,
        payload: CustomerOrderCreate,
    ) -> CustomerOrderResponse:
        """
        Login olmuş customer kullanıcısı için direct checkout siparişi oluşturur.

        Cart/guest akışı yoktur; sahiplik current_user.id üzerinden belirlenir.
        """
        self._ensure_customer_user(current_user)
        item_quantities = self._aggregate_items(payload.items)
        products = await self._get_active_products(item_quantities)

        order_items_data, total_amount = self._build_order_items(item_quantities, products)
        order_data = {
            "order_number": self._generate_order_number(),
            "customer_id": current_user.id,
            "status": "pending",
            "total_amount": total_amount,
            "notes": payload.notes,
            "shipping_full_name": payload.shipping.full_name,
            "shipping_phone": payload.shipping.phone,
            "shipping_address": payload.shipping.address,
            "shipping_city": payload.shipping.city,
            "shipping_district": payload.shipping.district,
            "shipping_postal_code": payload.shipping.postal_code,
            "shipping_country": payload.shipping.country,
            "shipping_note": payload.shipping.note,
        }

        order = await self._order_repo.create_order_with_items(order_data, order_items_data)
        await self._inventory_service.validate_and_deduct_stock_for_order(
            order_id=order.id,
            items=item_quantities,
            created_by_user_id=current_user.id,
        )

        created_order = await self._order_repo.get_customer_order_by_id(current_user.id, order.id)
        if created_order is None:
            raise NotFoundError(message=f"{order.id} numaralı sipariş bulunamadı.")

        logger.info(
            "Customer direct checkout siparişi oluşturuldu.",
            extra={"order_id": created_order.id, "customer_id": current_user.id},
        )
        return CustomerOrderResponse.model_validate(created_order)

    async def get_my_orders(
        self,
        current_user: User,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
    ) -> list[CustomerOrderResponse]:
        """Customer kullanıcının kendi siparişlerini listeler."""
        self._ensure_customer_user(current_user)
        status_filter = self._validate_status_filter(status)
        orders = await self._order_repo.get_customer_orders(
            current_user.id,
            skip=skip,
            limit=limit,
            status=status_filter,
        )
        return [CustomerOrderResponse.model_validate(order) for order in orders]

    async def get_my_order_detail(
        self,
        current_user: User,
        order_id: int,
    ) -> CustomerOrderResponse:
        """Customer kullanıcının sadece kendi sipariş detayını getirir."""
        self._ensure_customer_user(current_user)
        order = await self._order_repo.get_customer_order_by_id(current_user.id, order_id)
        if order is None:
            raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")
        return CustomerOrderResponse.model_validate(order)

    async def get_admin_orders(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
    ) -> list[AdminOrderResponse]:
        """Admin için tüm siparişleri listeler."""
        status_filter = self._validate_status_filter(status)
        orders = await self._order_repo.get_admin_orders(
            skip=skip,
            limit=limit,
            status=status_filter,
        )
        return [AdminOrderResponse.model_validate(order) for order in orders]

    async def get_admin_order_detail(self, order_id: int) -> AdminOrderResponse:
        """Admin için sipariş detayını getirir."""
        order = await self._order_repo.get_admin_order_by_id(order_id)
        if order is None:
            raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")
        return AdminOrderResponse.model_validate(order)

    async def update_order_status(
        self,
        order_id: int,
        payload: OrderStatusUpdate,
        changed_by_user: User,
    ) -> AdminOrderResponse:
        """Admin sipariş status güncelleme akışını yönetir."""
        order = await self._order_repo.get(order_id)
        if order is None:
            raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")

        old_status = order.status
        updated = await self._order_repo.update_order_status(order_id, payload.status)
        if updated is None:
            raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")

        if old_status != payload.status:
            await self._status_history_repo.create(
                {
                    "order_id": order_id,
                    "old_status": old_status,
                    "new_status": payload.status,
                    "changed_by_user_id": changed_by_user.id,
                    "reason": payload.reason,
                }
            )

        detailed_order = await self._order_repo.get_admin_order_by_id(order_id)
        if detailed_order is None:
            raise NotFoundError(message=f"{order_id} numaralı sipariş bulunamadı.")

        logger.info(
            "Sipariş durumu güncellendi.",
            extra={
                "order_id": order_id,
                "old_status": old_status,
                "new_status": payload.status,
                "changed_by_user_id": changed_by_user.id,
            },
        )
        return AdminOrderResponse.model_validate(detailed_order)

    async def get_today_summary(self) -> dict[str, object]:
        """Admin dashboard için günlük sipariş özetini döndürür."""
        orders = await self._order_repo.get_today_orders()
        status_counts = {status: 0 for status in ORDER_STATUSES}
        for order in orders:
            if order.status in status_counts:
                status_counts[order.status] += 1

        return {
            "date": datetime.now(tz=UTC).date().isoformat(),
            "total_orders": len(orders),
            "pending": status_counts["pending"],
            "processing": status_counts["processing"],
            "shipped": status_counts["shipped"],
            "delivered": status_counts["delivered"],
            "cancelled": status_counts["cancelled"],
            "total_revenue": Decimal(str(await self._order_repo.get_today_revenue())),
        }

    def _ensure_customer_user(self, user: User) -> None:
        if user.role != "customer":
            raise ForbiddenError(message="Sipariş oluşturmak ve görüntülemek için müşteri hesabı gereklidir.")

    def _aggregate_items(self, items: list[CustomerOrderItemCreate]) -> dict[int, int]:
        quantities: dict[int, int] = {}
        for item in items:
            quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity
            if quantities[item.product_id] > MAX_ORDER_ITEM_QUANTITY:
                raise BadRequestError(
                    message=f"Ürün #{item.product_id} için sipariş miktarı {MAX_ORDER_ITEM_QUANTITY} sınırını aşamaz."
                )
        return quantities

    async def _get_active_products(self, item_quantities: dict[int, int]) -> dict[int, Product]:
        products = await self._product_repo.get_by_ids(sorted(item_quantities))
        product_map = {product.id: product for product in products}

        for product_id in item_quantities:
            product = product_map.get(product_id)
            if product is None or not product.is_active:
                raise NotFoundError(message=f"{product_id} numaralı ürün bulunamadı.")

        return product_map

    def _build_order_items(
        self,
        item_quantities: dict[int, int],
        products: dict[int, Product],
    ) -> tuple[list[dict[str, object]], Decimal]:
        total_amount = Decimal("0.00")
        order_items: list[dict[str, object]] = []

        for product_id, quantity in item_quantities.items():
            product = products[product_id]
            item_total = product.price * quantity
            total_amount += item_total
            order_items.append(
                {
                    "product_id": product_id,
                    "quantity": quantity,
                    "unit_price": product.price,
                    "total_price": item_total,
                }
            )

        return order_items, total_amount

    def _validate_status_filter(self, status: str | None) -> str | None:
        if status is None:
            return None
        try:
            return validate_status(status, ORDER_STATUSES, "sipariş durumu")
        except ValueError as exc:
            raise BadRequestError(message=str(exc)) from exc

    def _generate_order_number(self) -> str:
        today = datetime.now(tz=UTC).strftime("%Y%m%d")
        return f"ORD-{today}-{uuid4().hex[:8].upper()}"
