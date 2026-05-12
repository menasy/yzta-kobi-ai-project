from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.shipment_event import ShipmentEvent
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.shipment_repository import ShipmentRepository
from app.schemas.customer_support import (
    CustomerCargoTrackingResponse,
    CustomerOrderLookupResponse,
    CustomerStockQueryResponse,
)

DISPLAY_TIMEZONE = ZoneInfo("Europe/Istanbul")

ORDER_STATUS_LABELS = {
    "pending": "Beklemede",
    "processing": "Hazırlanıyor",
    "shipped": "Kargoya Verildi",
    "delivered": "Teslim Edildi",
    "cancelled": "İptal Edildi",
}

SHIPMENT_STATUS_LABELS = {
    "created": "Kargo Hazırlanıyor",
    "in_transit": "Yolda",
    "delivered": "Teslim Edildi",
    "delayed": "Gecikme Var",
    "failed": "Teslim Edilemedi",
    "cancelled": "İptal Edildi",
}

MONTH_LABELS_TR = [
    "",
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
]


class CustomerSupportService:
    """Public müşteri destek sorguları için read-only servis."""

    def __init__(self, db: AsyncSession) -> None:
        self._order_repo = OrderRepository(db)
        self._product_repo = ProductRepository(db)
        self._inventory_repo = InventoryRepository(db)
        self._shipment_repo = ShipmentRepository(db)

    async def lookup_order(self, order_number: str) -> CustomerOrderLookupResponse:
        normalized_order_number = order_number.strip().upper()
        order = await self._order_repo.get_by_order_number_public(normalized_order_number)
        if order is None:
            raise NotFoundError(message="Sipariş bulunamadı. Lütfen numaranızı kontrol edip tekrar deneyin.")

        return CustomerOrderLookupResponse(
            order_number=order.order_number,
            status=ORDER_STATUS_LABELS.get(order.status, order.status),
            date=_format_date(order.placed_at),
            total=_format_try(order.total_amount),
        )

    async def query_stock(self, query: str) -> CustomerStockQueryResponse:
        normalized_query = query.strip()
        product = await self._product_repo.get_by_sku(normalized_query.upper())
        if product is None:
            products = await self._product_repo.search(normalized_query, limit=1)
            product = products[0] if products else None

        if product is None or not product.is_active:
            raise NotFoundError(message="Ürün bulunamadı. Lütfen ürün adı veya SKU bilgisini kontrol edin.")

        inventory = await self._inventory_repo.get_by_product_id_with_product(product.id)
        if inventory is None:
            return CustomerStockQueryResponse(
                product_name=product.name,
                sku=product.sku,
                in_stock=False,
                quantity=0,
                location=None,
            )

        available_quantity = max(inventory.available_quantity, 0)
        return CustomerStockQueryResponse(
            product_name=product.name,
            sku=product.sku,
            in_stock=available_quantity > 0,
            quantity=available_quantity,
            location="Ana Depo" if available_quantity > 0 else None,
        )

    async def track_cargo(self, tracking_number: str) -> CustomerCargoTrackingResponse:
        normalized_tracking_number = tracking_number.strip().upper()
        shipment = await self._shipment_repo.get_by_tracking_with_events(normalized_tracking_number)
        if shipment is None:
            raise NotFoundError(message="Kargo bulunamadı veya henüz sisteme girilmedi.")

        latest_event = _latest_event(shipment.events)
        return CustomerCargoTrackingResponse(
            tracking_number=shipment.tracking_number or normalized_tracking_number,
            company=_format_carrier(shipment.carrier),
            status=SHIPMENT_STATUS_LABELS.get(shipment.status, shipment.status),
            estimated_delivery=_format_estimated_delivery(
                shipment.status,
                shipment.estimated_delivery_date,
                shipment.delivered_at,
            ),
            last_update=_format_last_update(latest_event, shipment.status),
        )


def _format_date(value: datetime) -> str:
    local_value = value.astimezone(DISPLAY_TIMEZONE)
    return f"{local_value.day:02d} {MONTH_LABELS_TR[local_value.month]} {local_value.year}"


def _format_try(value: Decimal) -> str:
    formatted = f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{formatted} TL"


def _format_carrier(carrier: str) -> str:
    labels = {
        "yurtici": "Yurtiçi Kargo",
        "aras": "Aras Kargo",
        "mng": "MNG Kargo",
        "ptt": "PTT Kargo",
        "mock": "Test Kargo",
    }
    return labels.get(carrier.lower(), carrier)


def _format_estimated_delivery(
    status: str,
    estimated_delivery_date: datetime | None,
    delivered_at: datetime | None,
) -> str:
    if status == "delivered":
        if delivered_at is None:
            return "Teslim edildi"
        return f"{_format_date(delivered_at)} tarihinde teslim edildi"
    if estimated_delivery_date is None:
        return "Bilgi yok"
    return _format_date(estimated_delivery_date)


def _latest_event(events: list[ShipmentEvent]) -> ShipmentEvent | None:
    if not events:
        return None
    return max(events, key=lambda event: event.event_time or event.created_at)


def _format_last_update(event: ShipmentEvent | None, shipment_status: str) -> str:
    if event is None:
        return SHIPMENT_STATUS_LABELS.get(shipment_status, shipment_status)
    if event.description:
        return event.description
    if event.location:
        return event.location
    return SHIPMENT_STATUS_LABELS.get(event.status, event.status)
