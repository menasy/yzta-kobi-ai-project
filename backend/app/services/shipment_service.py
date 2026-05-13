# services/shipment_service.py
# Kargo CRUD ve durum yenileme iş mantığı.

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.core.logger import get_logger
from app.models.shipment import Shipment
from app.models.shipment_event import ShipmentEvent
from app.repositories.order_repository import OrderRepository
from app.repositories.shipment_event_repository import ShipmentEventRepository
from app.repositories.shipment_repository import ShipmentRepository
from app.schemas.common import SHIPMENT_STATUSES, validate_sanitized_field, validate_status
from app.schemas.shipment import (
    ShipmentCreate,
    ShipmentEventResponse,
    ShipmentListResponse,
    ShipmentResponse,
)
from app.services.cargo_query_service import CargoQueryService

logger = get_logger(__name__)


class ShipmentService:
    """Sevkiyat oluşturma, listeleme ve kargo durum yenileme iş kuralları."""

    def __init__(self, db: AsyncSession) -> None:
        self._shipment_repo = ShipmentRepository(db)
        self._event_repo = ShipmentEventRepository(db)
        self._order_repo = OrderRepository(db)
        self._cargo_query_service = CargoQueryService()

    async def create_shipment(self, payload: ShipmentCreate) -> ShipmentResponse:
        """Siparişe bağlı yeni sevkiyat kaydı oluşturur."""
        order = await self._order_repo.get(payload.order_id)
        if order is None:
            raise NotFoundError(message=f"{payload.order_id} numaralı sipariş bulunamadı.")

        existing_order_shipment = await self._shipment_repo.get_by_order(payload.order_id)
        if existing_order_shipment is not None:
            raise ConflictError(message=f"{payload.order_id} numaralı sipariş için kargo kaydı zaten mevcut.")

        tracking_number = payload.tracking_number or await self._generate_tracking_number(payload.carrier)
        existing_tracking = await self._shipment_repo.get_by_tracking(tracking_number)
        if existing_tracking is not None:
            raise ConflictError(message=f"{tracking_number} takip numarası zaten kullanılıyor.")

        shipment = await self._shipment_repo.create(
            {
                "order_id": payload.order_id,
                "carrier": payload.carrier,
                "tracking_number": tracking_number,
                "status": "created",
                "estimated_delivery_date": payload.estimated_delivery_date,
            }
        )
        await self._event_repo.create(
            {
                "shipment_id": shipment.id,
                "status": "created",
                "location": payload.location,
                "description": "Sevkiyat kaydı oluşturuldu.",
                "event_time": datetime.now(tz=UTC),
                "raw_payload": None,
            }
        )

        created = await self._shipment_repo.get_with_events(shipment.id)
        if created is None:
            raise NotFoundError(message="Oluşturulan kargo kaydı bulunamadı.")

        logger.info("Sevkiyat kaydı oluşturuldu.", extra={"shipment_id": shipment.id, "order_id": payload.order_id})
        return self._to_detail_response(created)

    async def get_shipment_by_tracking(self, tracking_number: str) -> ShipmentResponse:
        """Takip numarasıyla kargo detayını getirir."""
        normalized_tracking_number = self._normalize_tracking_number(tracking_number)
        shipment = await self._shipment_repo.get_by_tracking_with_events(normalized_tracking_number)
        if shipment is None:
            raise NotFoundError(message="Kargo kaydı bulunamadı.")
        return self._to_detail_response(shipment)

    async def list_shipments(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        carrier: str | None = None,
    ) -> list[ShipmentListResponse]:
        """Admin için kargo kayıtlarını listeler."""
        status_filter = self._validate_status_filter(status)
        carrier_filter = validate_sanitized_field(carrier).lower() if carrier else None
        shipments = await self._shipment_repo.list_shipments(
            skip=skip,
            limit=limit,
            status=status_filter,
            carrier=carrier_filter,
        )
        return [self._to_list_response(shipment) for shipment in shipments]

    async def refresh_shipment_status(self, tracking_number: str) -> ShipmentResponse:
        """Mock/entegrasyon kargo sağlayıcısından durumu yeniler."""
        normalized_tracking_number = self._normalize_tracking_number(tracking_number)
        shipment = await self._shipment_repo.get_by_tracking_with_events(normalized_tracking_number)
        if shipment is None:
            raise NotFoundError(message="Kargo kaydı bulunamadı.")

        provider_result = await self._cargo_query_service.get_cargo_status(normalized_tracking_number)
        provider_status = provider_result.get("status")
        if provider_status == "not_found":
            raise NotFoundError(message="Kargo sağlayıcısında takip numarası bulunamadı.")

        status = validate_status(str(provider_status), SHIPMENT_STATUSES, "kargo durumu")
        checked_at = datetime.now(tz=UTC)
        event_time = self._parse_datetime(provider_result.get("last_update")) or checked_at
        estimated_delivery_date = self._parse_datetime(provider_result.get("estimated_delivery"))

        update_data = {
            "status": status,
            "last_checked_at": checked_at,
            "estimated_delivery_date": estimated_delivery_date or shipment.estimated_delivery_date,
            "delivered_at": event_time if status == "delivered" else None,
        }
        shipment = await self._shipment_repo.update(shipment.id, update_data)
        if shipment is None:
            raise NotFoundError(message="Kargo kaydı bulunamadı.")

        await self._event_repo.create(
            {
                "shipment_id": shipment.id,
                "status": status,
                "location": provider_result.get("location"),
                "description": provider_result.get("detail"),
                "event_time": event_time,
                "raw_payload": provider_result,
            }
        )

        refreshed = await self._shipment_repo.get_with_events(shipment.id)
        if refreshed is None:
            raise NotFoundError(message="Güncellenen kargo kaydı bulunamadı.")

        logger.info("Kargo durumu yenilendi.", extra={"shipment_id": shipment.id, "status": status})

        # Kargo teslim edildiyse sipariş durumunu da senkronize et
        if status == "delivered":
            await self._sync_order_delivered(shipment.order_id)

        return self._to_detail_response(refreshed)

    async def list_delayed_shipments(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ShipmentListResponse]:
        """Geciken veya tahmini teslim tarihi geçmiş aktif kargoları listeler."""
        shipments = await self._shipment_repo.get_delayed(
            now=datetime.now(tz=UTC),
            skip=skip,
            limit=limit,
        )
        return [self._to_list_response(shipment) for shipment in shipments]

    async def _sync_order_delivered(self, order_id: int) -> None:
        """Kargo teslim edildiğinde ilişkili siparişi de 'delivered' yapar."""
        order = await self._order_repo.get(order_id)
        if order is None or order.status == "delivered":
            return  # Sipariş yoksa veya zaten teslim edilmişse atla

        await self._order_repo.update_order_status(order_id, "delivered")
        logger.info(
            "Sipariş durumu kargo ile senkronize edildi.",
            extra={"order_id": order_id, "new_order_status": "delivered"},
        )

    async def _generate_tracking_number(self, carrier: str) -> str:
        prefix = "".join(char for char in carrier.upper() if char.isalnum())[:3] or "KRG"
        for _ in range(5):
            tracking_number = f"{prefix}{uuid4().hex[:10].upper()}"
            if await self._shipment_repo.get_by_tracking(tracking_number) is None:
                return tracking_number
        return f"{prefix}{uuid4().hex.upper()}"

    @staticmethod
    def _validate_status_filter(status: str | None) -> str | None:
        if status is None:
            return None
        return validate_status(status, SHIPMENT_STATUSES, "kargo durumu")

    @staticmethod
    def _normalize_tracking_number(tracking_number: str) -> str:
        sanitized = validate_sanitized_field(tracking_number)
        return sanitized.upper() if sanitized else tracking_number.upper()

    @staticmethod
    def _parse_datetime(value: object) -> datetime | None:
        if not isinstance(value, str) or not value:
            return None
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=UTC)
        return parsed

    def _to_detail_response(self, shipment: Shipment) -> ShipmentResponse:
        events = self._sorted_events(shipment.events)
        latest_event = events[-1] if events else None
        return ShipmentResponse(
            id=shipment.id,
            order_id=shipment.order_id,
            carrier=shipment.carrier,
            tracking_number=shipment.tracking_number,
            status=shipment.status,
            location=latest_event.location if latest_event else None,
            estimated_delivery_date=shipment.estimated_delivery_date,
            delivered_at=shipment.delivered_at,
            last_checked_at=shipment.last_checked_at,
            created_at=shipment.created_at,
            updated_at=shipment.updated_at,
            events=[ShipmentEventResponse.model_validate(event) for event in events],
        )

    def _to_list_response(self, shipment: Shipment) -> ShipmentListResponse:
        latest_event = self._sorted_events(shipment.events)[-1] if shipment.events else None
        return ShipmentListResponse(
            id=shipment.id,
            order_id=shipment.order_id,
            carrier=shipment.carrier,
            tracking_number=shipment.tracking_number,
            status=shipment.status,
            location=latest_event.location if latest_event else None,
            estimated_delivery_date=shipment.estimated_delivery_date,
            created_at=shipment.created_at,
        )

    @staticmethod
    def _sorted_events(events: list[ShipmentEvent]) -> list[ShipmentEvent]:
        return sorted(events, key=lambda event: (event.event_time or event.created_at, event.id))
