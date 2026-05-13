"""Production-like demo seed data for the KOBI AI Agent project.

This script is intentionally idempotent:
- it records a successful run in seed_runs;
- it never truncates or deletes existing business data;
- it uses stable natural keys for demo users, products, orders and shipments.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Literal

from sqlalchemy import delete, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.agent.memory import ConversationMemory
from app.core.logger import get_logger, setup_logging
from app.core.security import hash_password
from app.db.session import close_db_connections, get_session_factory
from app.models import (
    AuditLog,
    Conversation,
    Customer,
    Inventory,
    InventoryMovement,
    Notification,
    Order,
    OrderItem,
    OrderStatusHistory,
    Product,
    Shipment,
    ShipmentEvent,
    User,
    UserAddress,
)

SEED_NAME = "kobi_demo_seed"
SEED_VERSION = "2026-05-13.light.1"
SEED_CHECKSUM = "kobi-demo-light-seed-v1"
DEFAULT_PASSWORD = os.getenv("SEED_DEMO_PASSWORD", "Demo12345!")
ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@kobi.local")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin123!")
OWNER_EMAIL = os.getenv("SEED_OWNER_EMAIL", "isletme@kobi.local")
DEMO_EMAIL = os.getenv("SEED_DEMO_EMAIL", "demo@kobi.local")

setup_logging(level=os.getenv("LOG_LEVEL", "INFO"), json_output=False)
logger = get_logger("seed_all")

OrderStatus = Literal["pending", "processing", "shipped", "delivered", "cancelled"]
ShipmentStatus = Literal["created", "in_transit", "delivered", "delayed", "failed", "cancelled"]


@dataclass(frozen=True)
class ProductSeed:
    name: str
    sku: str
    description: str
    price: Decimal
    category: str
    image_url: str
    target_quantity: int
    threshold: int
    active: bool = True


@dataclass(frozen=True)
class PersonSeed:
    full_name: str
    email: str
    phone: str
    role: str
    city: str
    district: str
    address: str
    postal_code: str
    source_channel: str = "web"
    active: bool = True


@dataclass(frozen=True)
class OrderSeed:
    number: str
    customer_email: str
    status: OrderStatus
    days_ago: int
    hour: int
    item_skus: tuple[str, ...]
    quantities: tuple[int, ...]
    notes: str | None = None


PRODUCTS: tuple[ProductSeed, ...] = (
    # 8 product types only: enough to cover critical stock, low stock, normal stock,
    # fast-selling, dead-stock, high-ticket/B2B and shipment/order demo scenarios.
    ProductSeed(
        "Soğuk Sıkım Zeytinyağı 750 ml",
        "GDA-ZYT-750",
        "Ege zeytinlerinden düşük asitli, cam şişede naturel sızma zeytinyağı.",
        Decimal("432.00"),
        "Gıda",
        "/product/zeytin-yagi.jpg",
        0,
        6,
    ),
    ProductSeed(
        "Acı Pul Biber 250 g",
        "GDA-PUL-250",
        "Güneşte kurutulmuş biberlerden üretilen yoğun aromalı pul biber.",
        Decimal("203.00"),
        "Gıda",
        "/product/pulbiber.webp",
        4,
        10,
    ),
    ProductSeed(
        "Çilek Reçeli 460 g",
        "GDA-REC-460",
        "Küçük parti üretim, parça meyveli ev tipi çilek reçeli.",
        Decimal("187.50"),
        "Gıda",
        "/product/recel.webp",
        22,
        8,
    ),
    ProductSeed(
        "Filtre Kahve Harmanı 250 g",
        "KHV-FLT-250",
        "Orta kavrum, dengeli gövdeli butik kahve harmanı.",
        Decimal("285.00"),
        "Kahve",
        "/product/pekmez.webp",
        36,
        12,
    ),
    ProductSeed(
        "Seramik Kahve Kupası",
        "ELI-KUP-001",
        "El yapımı, reaktif sırlı seramik kahve kupası.",
        Decimal("275.00"),
        "El Yapımı",
        "/product/pekmez.webp",
        34,
        8,
    ),
    ProductSeed(
        "Keten Bez Çanta",
        "TEK-BEZ-001",
        "Pamuk astarlı, günlük kullanıma uygun el dikimi bez çanta.",
        Decimal("249.00"),
        "Tekstil",
        "/product/recel.webp",
        18,
        8,
    ),
    ProductSeed(
        "Lavanta Sabunu 90 g",
        "KZM-SBN-090",
        "Soğuk proses lavanta sabunu, hassas ciltler için nazik formül.",
        Decimal("89.00"),
        "Kozmetik",
        "/product/nane.webp",
        48,
        15,
    ),
    ProductSeed(
        "B2B Kahvaltılık Paket",
        "B2B-KAH-010",
        "Kafe ve butik oteller için 10'lu yöresel kahvaltılık paket.",
        Decimal("1850.00"),
        "B2B Paket",
        "/product/zeytin-yagi.jpg",
        9,
        4,
    ),
)

PEOPLE: tuple[PersonSeed, ...] = (
    PersonSeed(
        "Sistem Yöneticisi",
        ADMIN_EMAIL,
        "905321000001",
        "admin",
        "İstanbul",
        "Kadıköy",
        "Rıhtım Cd. No:12 Kat:4",
        "34710",
    ),
    PersonSeed(
        "Ayşe Demir",
        OWNER_EMAIL,
        "905321000002",
        "admin",
        "İzmir",
        "Konak",
        "Gazi Blv. No:45",
        "35210",
    ),
    PersonSeed(
        "Demo Kullanıcı",
        DEMO_EMAIL,
        "905321000004",
        "customer",
        "Bursa",
        "Nilüfer",
        "Ataevler Mah. Pazar Cd. No:7",
        "16140",
    ),
    PersonSeed(
        "Mavi Perakende Ltd.",
        "satinalma@maviperakende.com",
        "905334440101",
        "customer",
        "İstanbul",
        "Şişli",
        "Halaskargazi Cd. No:92",
        "34371",
        "web",
    ),
    PersonSeed(
        "Deniz Kafe İşletmeleri",
        "operasyon@denizkafe.com",
        "905334440102",
        "customer",
        "İzmir",
        "Alsancak",
        "Kıbrıs Şehitleri Cd. No:144",
        "35220",
        "agent",
    ),
    PersonSeed(
        "Selin Arslan",
        "selin.arslan@example.com",
        "905334440103",
        "customer",
        "Ankara",
        "Çankaya",
        "Kavaklıdere Mah. Büklüm Sk. No:21",
        "06680",
        "web",
    ),
)

CUSTOMER_PROFILES: tuple[PersonSeed, ...] = tuple(
    person for person in PEOPLE if person.role == "customer"
)



def _now() -> datetime:
    return datetime.now(tz=UTC)


def _seed_time(days_ago: int, hour: int, minute: int = 12) -> datetime:
    base = _now() - timedelta(days=days_ago)
    return base.replace(hour=hour, minute=minute, second=0, microsecond=0)


async def _seed_already_completed(session: AsyncSession) -> bool:
    result = await session.execute(
        text(
            """
            SELECT 1
            FROM seed_runs
            WHERE seed_name = :seed_name
              AND status = 'success'
            LIMIT 1
            """
        ),
        {"seed_name": SEED_NAME},
    )
    return result.scalar_one_or_none() is not None


async def _database_has_business_data(session: AsyncSession) -> bool:
    probes = (
        select(User.id).limit(1),
        select(Customer.id).limit(1),
        select(Product.id).limit(1),
        select(Order.id).limit(1),
        select(Shipment.id).limit(1),
    )
    for probe in probes:
        result = await session.execute(probe)
        if result.scalar_one_or_none() is not None:
            return True
    return False


async def _database_has_seed_fingerprint(session: AsyncSession) -> bool:
    demo_emails = [person.email for person in PEOPLE]
    demo_skus = [product.sku for product in PRODUCTS[:5]]

    probes = (
        select(User.id).where(User.email.in_(demo_emails)).limit(1),
        select(Product.id).where(Product.sku.in_(demo_skus)).limit(1),
        select(Order.id).where(Order.order_number.like("KOBI-DEMO-%")).limit(1),
        select(Shipment.id).where(Shipment.tracking_number.like("KOBI-DEMO-%")).limit(1),
        select(Notification.id).where(
            or_(
                Notification.payload["seed"].as_string() == SEED_NAME,
                Notification.title.like("%demo%"),
            )
        ).limit(1),
    )
    for probe in probes:
        result = await session.execute(probe)
        if result.scalar_one_or_none() is not None:
            return True
    return False


async def _record_seed_success(session: AsyncSession, summary: dict[str, int]) -> None:
    now = _now()
    await session.execute(
        text(
            """
            INSERT INTO seed_runs (seed_name, version, checksum, status, started_at, finished_at, summary)
            VALUES (:seed_name, :version, :checksum, 'success', :started_at, :finished_at, CAST(:summary AS jsonb))
            ON CONFLICT ON CONSTRAINT uq_seed_runs_seed_name DO UPDATE SET
                version = EXCLUDED.version,
                checksum = EXCLUDED.checksum,
                status = EXCLUDED.status,
                started_at = EXCLUDED.started_at,
                finished_at = EXCLUDED.finished_at,
                summary = EXCLUDED.summary
            """
        ),
        {
            "seed_name": SEED_NAME,
            "version": SEED_VERSION,
            "checksum": SEED_CHECKSUM,
            "started_at": now,
            "finished_at": now,
            "summary": json.dumps(summary, ensure_ascii=False),
        },
    )


def _password_for(person: PersonSeed) -> str:
    if person.email == ADMIN_EMAIL:
        return ADMIN_PASSWORD
    return DEFAULT_PASSWORD


async def _upsert_users_and_addresses(session: AsyncSession) -> dict[str, User]:
    users: dict[str, User] = {}
    for person in PEOPLE:
        result = await session.execute(select(User).where(User.email == person.email))
        user = result.scalar_one_or_none()
        if user is None:
            user = User(
                email=person.email,
                hashed_password=hash_password(_password_for(person)),
                full_name=person.full_name,
                role=person.role,
                is_active=person.active,
            )
            session.add(user)
            await session.flush()
        else:
            user.full_name = person.full_name
            user.role = person.role
            user.is_active = person.active

        users[person.email] = user

        result = await session.execute(select(UserAddress).where(UserAddress.user_id == user.id))
        address = result.scalar_one_or_none()
        address_data = {
            "full_name": person.full_name,
            "phone": person.phone,
            "address": person.address,
            "city": person.city,
            "district": person.district,
            "postal_code": person.postal_code,
            "country": "Türkiye",
            "note": "Demo varsayılan teslimat ve fatura adresi",
            "is_default": True,
        }
        if address is None:
            session.add(UserAddress(user_id=user.id, **address_data))
        else:
            for key, value in address_data.items():
                setattr(address, key, value)

    await session.flush()
    return users


async def _upsert_customers(session: AsyncSession) -> dict[str, Customer]:
    customers: dict[str, Customer] = {}
    for person in CUSTOMER_PROFILES:
        result = await session.execute(select(Customer).where(Customer.email == person.email))
        customer = result.scalar_one_or_none()
        if customer is None:
            customer = Customer(
                full_name=person.full_name,
                phone=person.phone,
                email=person.email,
                source_channel=person.source_channel,
                is_active=person.active,
            )
            session.add(customer)
            await session.flush()
        else:
            customer.full_name = person.full_name
            customer.phone = person.phone
            customer.source_channel = person.source_channel
            customer.is_active = person.active
        customers[person.email] = customer
    return customers


async def _upsert_products(session: AsyncSession) -> dict[str, Product]:
    products: dict[str, Product] = {}
    for seed in PRODUCTS:
        result = await session.execute(select(Product).where(Product.sku == seed.sku))
        product = result.scalar_one_or_none()
        if product is None:
            product = Product(
                name=seed.name,
                sku=seed.sku,
                description=seed.description,
                price=seed.price,
                category=seed.category,
                image_url=seed.image_url,
                is_active=seed.active,
            )
            session.add(product)
            await session.flush()
        else:
            product.name = seed.name
            product.description = seed.description
            product.price = seed.price
            product.category = seed.category
            product.image_url = seed.image_url
            product.is_active = seed.active
        products[seed.sku] = product

        result = await session.execute(select(Inventory).where(Inventory.product_id == product.id))
        inventory = result.scalar_one_or_none()
        if inventory is None:
            session.add(
                Inventory(
                    product_id=product.id,
                    quantity=seed.target_quantity,
                    reserved_quantity=0,
                    low_stock_threshold=seed.threshold,
                )
            )
        else:
            inventory.quantity = seed.target_quantity
            inventory.reserved_quantity = 0
            inventory.low_stock_threshold = seed.threshold

    await session.flush()
    return products


def _order_seeds() -> list[OrderSeed]:
    """Small but complete order set: one clear example per operational scenario."""
    return [
        OrderSeed(
            number="KOBI-DEMO-0001",
            customer_email=DEMO_EMAIL,
            status="pending",
            days_ago=0,
            hour=9,
            item_skus=("GDA-REC-460",),
            quantities=(1,),
            notes="Yeni alınmış, henüz işlenmemiş sipariş.",
        ),
        OrderSeed(
            number="KOBI-DEMO-0002",
            customer_email="satinalma@maviperakende.com",
            status="processing",
            days_ago=0,
            hour=11,
            item_skus=("KHV-FLT-250", "KZM-SBN-090"),
            quantities=(2, 3),
            notes="Operasyon ekibi tarafından hazırlanan sipariş.",
        ),
        OrderSeed(
            number="KOBI-DEMO-0003",
            customer_email="selin.arslan@example.com",
            status="shipped",
            days_ago=1,
            hour=13,
            item_skus=("TEK-BEZ-001",),
            quantities=(1,),
            notes="Kargoda ilerleyen normal sipariş.",
        ),
        OrderSeed(
            number="KOBI-DEMO-0004",
            customer_email="operasyon@denizkafe.com",
            status="delivered",
            days_ago=3,
            hour=10,
            item_skus=("B2B-KAH-010",),
            quantities=(1,),
            notes="Başarıyla teslim edilen B2B sipariş.",
        ),
        OrderSeed(
            number="KOBI-DEMO-0005",
            customer_email="satinalma@maviperakende.com",
            status="shipped",
            days_ago=5,
            hour=15,
            item_skus=("GDA-PUL-250", "GDA-ZYT-750"),
            quantities=(2, 1),
            notes="Tahmini teslim tarihi geçmiş, gecikme senaryosu.",
        ),
        OrderSeed(
            number="KOBI-DEMO-0006",
            customer_email="selin.arslan@example.com",
            status="shipped",
            days_ago=4,
            hour=16,
            item_skus=("ELI-KUP-001",),
            quantities=(1,),
            notes="Dağıtımda sorun yaşanan teslimat senaryosu.",
        ),
        OrderSeed(
            number="KOBI-DEMO-0007",
            customer_email=DEMO_EMAIL,
            status="cancelled",
            days_ago=6,
            hour=14,
            item_skus=("GDA-REC-460",),
            quantities=(1,),
            notes="Müşteri talebiyle iptal edilen sipariş.",
        ),
    ]


def _status_steps(status: OrderStatus) -> list[tuple[str | None, str, str]]:
    steps: list[tuple[str | None, str, str]] = [(None, "pending", "Sipariş oluşturuldu.")]
    if status in {"processing", "shipped", "delivered"}:
        steps.append(("pending", "processing", "Operasyon ekibi hazırlığa aldı."))
    if status in {"shipped", "delivered"}:
        steps.append(("processing", "shipped", "Sipariş kargoya teslim edildi."))
    if status == "delivered":
        steps.append(("shipped", "delivered", "Teslimat başarıyla tamamlandı."))
    if status == "cancelled":
        steps.append(("pending", "cancelled", "Müşteri talebiyle iptal/iade kaydı açıldı."))
    return steps


async def _upsert_orders(
    session: AsyncSession,
    users: dict[str, User],
    people_by_email: dict[str, PersonSeed],
    products: dict[str, Product],
    actor: User,
) -> list[Order]:
    orders: list[Order] = []
    for seed in _order_seeds():
        result = await session.execute(select(Order).where(Order.order_number == seed.number))
        order = result.scalar_one_or_none()
        customer = users[seed.customer_email]
        person = people_by_email[seed.customer_email]
        placed_at = _seed_time(seed.days_ago, seed.hour)
        cancelled_at = placed_at + timedelta(hours=5) if seed.status == "cancelled" else None

        item_payload: list[tuple[Product, int, Decimal]] = []
        total = Decimal("0.00")
        for sku, quantity in zip(seed.item_skus, seed.quantities, strict=True):
            product = products[sku]
            line_total = product.price * quantity
            item_payload.append((product, quantity, line_total))
            total += line_total

        if order is None:
            order = Order(
                order_number=seed.number,
                customer_id=customer.id,
                status=seed.status,
                total_amount=total,
                notes=seed.notes,
                shipping_full_name=person.full_name,
                shipping_phone=person.phone,
                shipping_address=person.address,
                shipping_city=person.city,
                shipping_district=person.district,
                shipping_postal_code=person.postal_code,
                shipping_country="Türkiye",
                shipping_note="Demo teslimat adresi",
                placed_at=placed_at,
                cancelled_at=cancelled_at,
                created_at=placed_at,
                updated_at=placed_at + timedelta(hours=1),
            )
            session.add(order)
            await session.flush()
        else:
            order.customer_id = customer.id
            order.status = seed.status
            order.total_amount = total
            order.notes = seed.notes
            order.shipping_full_name = person.full_name
            order.shipping_phone = person.phone
            order.shipping_address = person.address
            order.shipping_city = person.city
            order.shipping_district = person.district
            order.shipping_postal_code = person.postal_code
            order.shipping_country = "Türkiye"
            order.shipping_note = "Demo teslimat adresi"
            order.placed_at = placed_at
            order.cancelled_at = cancelled_at

        await session.execute(delete(OrderItem).where(OrderItem.order_id == order.id))
        await session.flush()

        for product, quantity, line_total in item_payload:
            session.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=product.price,
                    total_price=line_total,
                    created_at=placed_at,
                    updated_at=placed_at,
                )
            )

        await session.execute(
            delete(OrderStatusHistory).where(OrderStatusHistory.order_id == order.id)
        )
        await session.flush()
        previous_time = placed_at
        for step_index, (old_status, new_status, reason) in enumerate(_status_steps(seed.status)):
            event_time = previous_time + timedelta(hours=step_index * 6)
            session.add(
                OrderStatusHistory(
                    order_id=order.id,
                    old_status=old_status,
                    new_status=new_status,
                    changed_by_user_id=actor.id,
                    reason=reason,
                    created_at=event_time,
                    updated_at=event_time,
                )
            )
        orders.append(order)

    await session.flush()
    return orders


def _shipment_status_for_order(order: Order, index: int) -> ShipmentStatus | None:
    """Deterministic compact shipment scenarios for the small demo set."""
    if order.status == "pending":
        return None
    if order.status == "processing":
        return "created"
    if order.status == "cancelled":
        return "cancelled"
    if order.status == "delivered":
        return "delivered"
    if order.order_number == "KOBI-DEMO-0005":
        return "delayed"
    if order.order_number == "KOBI-DEMO-0006":
        return "failed"
    return "in_transit"


def _shipment_events(
    status: ShipmentStatus,
    city: str,
    base_time: datetime,
) -> list[tuple[ShipmentStatus, str, str, datetime]]:
    events: list[tuple[ShipmentStatus, str, str, datetime]] = [
        ("created", "İstanbul Avrupa Operasyon Merkezi", "Sevkiyat kaydı oluşturuldu.", base_time),
    ]
    if status == "created":
        return events
    events.append(
        (
            "in_transit",
            "İstanbul Transfer Merkezi",
            "Paket transfer merkezine ulaştı.",
            base_time + timedelta(hours=8),
        )
    )
    if status == "delayed":
        events.append(
            (
                "delayed",
                f"{city} Bölge Aktarma",
                "Hava koşulları nedeniyle teslimat gecikti.",
                base_time + timedelta(days=2, hours=2),
            )
        )
    elif status == "failed":
        events.append(
            (
                "failed",
                f"{city} Dağıtım Şubesi",
                "Alıcı adreste bulunamadı; tekrar dağıtıma planlandı.",
                base_time + timedelta(days=2, hours=5),
            )
        )
    elif status == "delivered":
        events.append(
            (
                "delivered",
                city,
                "Teslimat alıcıya imza karşılığı tamamlandı.",
                base_time + timedelta(days=2, hours=4),
            )
        )
    elif status == "cancelled":
        events.append(
            (
                "cancelled",
                "Operasyon Merkezi",
                "Sipariş iptal edildiği için sevkiyat durduruldu.",
                base_time + timedelta(hours=10),
            )
        )
    return events


async def _upsert_shipments(session: AsyncSession, orders: list[Order]) -> list[Shipment]:
    shipments: list[Shipment] = []
    carriers = ("yurtici", "aras", "mng", "ptt", "mock")
    for index, order in enumerate(orders, start=1):
        status = _shipment_status_for_order(order, index)
        if status is None:
            continue

        result = await session.execute(select(Shipment).where(Shipment.order_id == order.id))
        shipment = result.scalar_one_or_none()
        tracking_number = f"{carriers[index % len(carriers)].upper()}{202605130000 + index}"
        event_base = order.placed_at + timedelta(hours=12)
        delivered_at = event_base + timedelta(days=2, hours=4) if status == "delivered" else None
        estimated_delivery = order.placed_at + timedelta(days=3)
        if status == "delayed":
            estimated_delivery = order.placed_at - timedelta(days=1)

        if shipment is None:
            shipment = Shipment(
                order_id=order.id,
                carrier=carriers[index % len(carriers)],
                tracking_number=tracking_number,
                status=status,
                estimated_delivery_date=estimated_delivery,
                delivered_at=delivered_at,
                last_checked_at=_now() - timedelta(hours=index % 12),
                created_at=event_base,
                updated_at=event_base,
            )
            session.add(shipment)
            await session.flush()
        else:
            shipment.carrier = carriers[index % len(carriers)]
            shipment.tracking_number = tracking_number
            shipment.status = status
            shipment.estimated_delivery_date = estimated_delivery
            shipment.delivered_at = delivered_at
            shipment.last_checked_at = _now() - timedelta(hours=index % 12)

        await session.execute(
            delete(ShipmentEvent).where(ShipmentEvent.shipment_id == shipment.id)
        )
        await session.flush()

        events = _shipment_events(status, order.shipping_city, event_base)
        for event_status, location, description, event_time in events:
            session.add(
                ShipmentEvent(
                    shipment_id=shipment.id,
                    status=event_status,
                    location=location,
                    description=description,
                    event_time=event_time,
                    raw_payload={"provider": shipment.carrier, "tracking_number": tracking_number},
                    created_at=event_time,
                    updated_at=event_time,
                )
            )
        shipments.append(shipment)

    await session.flush()
    return shipments


async def _seed_inventory_movements(
    session: AsyncSession,
    products: dict[str, Product],
    orders: list[Order],
    actor: User,
) -> int:
    result = await session.execute(
        select(InventoryMovement).where(InventoryMovement.reason.like("KOBI demo:%"))
    )
    for movement in result.scalars().all():
        await session.delete(movement)
    await session.flush()

    quantities: dict[int, int] = {}
    count = 0
    for seed in PRODUCTS:
        product = products[seed.sku]
        start_quantity = seed.target_quantity + 90
        quantities[product.id] = start_quantity
        created_at = _now() - timedelta(days=90)
        session.add(
            InventoryMovement(
                product_id=product.id,
                order_id=None,
                movement_type="stock_in",
                quantity_change=start_quantity,
                previous_quantity=0,
                new_quantity=start_quantity,
                reason="KOBI demo: sezon başı depo girişi",
                created_by_user_id=actor.id,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        count += 1

    sorted_orders = sorted(orders, key=lambda item: item.placed_at)
    for order in sorted_orders:
        result = await session.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        for item in result.scalars().all():
            previous = quantities[item.product_id]
            if order.status == "cancelled":
                new_quantity = previous
                quantity_change = 0
                movement_type = "order_cancelled"
                reason = f"KOBI demo: {order.order_number} iptal/iade rezervasyon kapatma"
            else:
                new_quantity = previous - item.quantity
                quantity_change = -item.quantity
                movement_type = "order_deducted"
                reason = f"KOBI demo: {order.order_number} sipariş stok düşümü"
            quantities[item.product_id] = new_quantity
            created_at = order.placed_at + timedelta(minutes=20)
            session.add(
                InventoryMovement(
                    product_id=item.product_id,
                    order_id=order.id,
                    movement_type=movement_type,
                    quantity_change=quantity_change,
                    previous_quantity=previous,
                    new_quantity=new_quantity,
                    reason=reason,
                    created_by_user_id=actor.id,
                    created_at=created_at,
                    updated_at=created_at,
                )
            )
            count += 1

    manual_adjustments = ("GDA-PUL-250", "GDA-ZYT-750", "ELI-KUP-001")
    for sku in manual_adjustments:
        product = products[sku]
        previous = quantities[product.id]
        new_quantity = max(previous - 3, 0)
        quantities[product.id] = new_quantity
        created_at = _now() - timedelta(days=5)
        session.add(
            InventoryMovement(
                product_id=product.id,
                order_id=None,
                movement_type="adjustment",
                quantity_change=new_quantity - previous,
                previous_quantity=previous,
                new_quantity=new_quantity,
                reason="KOBI demo: sayım sonrası manuel düzeltme",
                created_by_user_id=actor.id,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        count += 1

    for sku in ("KZM-SBN-090", "KHV-FLT-250"):
        product = products[sku]
        previous = quantities[product.id]
        new_quantity = previous + 6
        quantities[product.id] = new_quantity
        created_at = _now() - timedelta(days=3)
        session.add(
            InventoryMovement(
                product_id=product.id,
                order_id=None,
                movement_type="stock_in",
                quantity_change=6,
                previous_quantity=previous,
                new_quantity=new_quantity,
                reason="KOBI demo: iade kaynaklı stok girişi",
                created_by_user_id=actor.id,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        count += 1

    for seed in PRODUCTS:
        product = products[seed.sku]
        previous = quantities[product.id]
        if previous == seed.target_quantity:
            continue
        created_at = _now() - timedelta(hours=6)
        session.add(
            InventoryMovement(
                product_id=product.id,
                order_id=None,
                movement_type="adjustment",
                quantity_change=seed.target_quantity - previous,
                previous_quantity=previous,
                new_quantity=seed.target_quantity,
                reason="KOBI demo: güncel demo stok seviyesi kalibrasyonu",
                created_by_user_id=actor.id,
                created_at=created_at,
                updated_at=created_at,
            )
        )
        count += 1

    await session.flush()
    return count


async def _seed_notifications(
    session: AsyncSession,
    products: dict[str, Product],
    orders: list[Order],
    shipments: list[Shipment],
) -> int:
    result = await session.execute(
        select(Notification).where(Notification.payload["seed"].as_string() == SEED_NAME)
    )
    for notification in result.scalars().all():
        await session.delete(notification)
    await session.flush()

    delayed = next((shipment for shipment in shipments if shipment.status == "delayed"), None)
    failed = next((shipment for shipment in shipments if shipment.status == "failed"), None)
    latest_order = max(orders, key=lambda order: order.placed_at)
    notification_specs = [
        (
            "LOW_STOCK_ALERT",
            "Kritik stok uyarısı",
            "Soğuk Sıkım Zeytinyağı 750 ml stokta kalmadı.",
            "critical",
            {"product_id": products["GDA-ZYT-750"].id, "sku": "GDA-ZYT-750"},
        ),
        (
            "SYSTEM",
            "Yeni sipariş alındı",
            f"{latest_order.order_number} numaralı sipariş oluşturuldu.",
            "info",
            {"order_id": latest_order.id},
        ),
        (
            "SHIPMENT_DELAYED",
            "Kargo gecikmesi",
            "Bir sevkiyat tahmini teslim tarihini geçti.",
            "critical",
            {"shipment_id": delayed.id if delayed else None},
        ),
        (
            "SHIPMENT_DELAY",
            "Problemli teslimat",
            "Dağıtım ekibi alıcıya ulaşamadı; müşteri bilgilendirmesi gerekiyor.",
            "warning",
            {"shipment_id": failed.id if failed else None},
        ),
        (
            "DAILY_SUMMARY",
            "Günlük operasyon özeti hazır",
            "Bugün kritik stok, yeni sipariş ve geciken kargo özetleri güncellendi.",
            "info",
            {"date": _now().date().isoformat()},
        ),
    ]
    for index, (type_, title, message, severity, payload) in enumerate(notification_specs):
        created_at = _now() - timedelta(hours=index * 3)
        is_read = index == 4
        payload["seed"] = SEED_NAME
        session.add(
            Notification(
                type=type_,
                title=title,
                message=message,
                severity=severity,
                payload=payload,
                is_read=is_read,
                read_at=created_at + timedelta(minutes=30) if is_read else None,
                created_at=created_at,
                updated_at=created_at,
            )
        )
    await session.flush()
    return len(notification_specs)


async def _seed_conversations(
    session: AsyncSession,
    customers: dict[str, Customer],
) -> tuple[int, int]:
    result = await session.execute(select(Conversation).where(Conversation.session_id.like("conv-demo-%")))
    for conversation in result.scalars().all():
        await session.delete(conversation)
    await session.flush()

    scenarios = [
        ("conv-demo-order-where", DEMO_EMAIL, "web", "resolved", "Siparişim nerede?"),
        ("conv-demo-stock-query", "satinalma@maviperakende.com", "web", "resolved", "Zeytinyağı stokta var mı?"),
        ("conv-demo-delay", "selin.arslan@example.com", "agent", "active", "Kargom gecikti."),
    ]
    redis_messages: dict[str, list[dict[str, str]]] = {}
    for index, (session_id, email, channel, status, question) in enumerate(scenarios):
        customer = customers[email]
        last_message_at = _now() - timedelta(hours=index + 1)
        session.add(
            Conversation(
                session_id=session_id,
                customer_id=customer.id,
                user_identifier=email,
                channel=channel,
                status=status,
                last_message_at=last_message_at,
                created_at=last_message_at - timedelta(minutes=12),
                updated_at=last_message_at,
            )
        )
        redis_messages[session_id] = [
            {"role": "user", "content": question},
            {
                "role": "assistant",
                "content": (
                    "Kontrol ettim. Sipariş, stok veya kargo bilgisini güncel operasyon verisine göre özetledim."
                ),
            },
        ]
    await session.flush()

    redis_seeded = 0
    memory = ConversationMemory()
    for session_id, messages in redis_messages.items():
        try:
            await memory.save(session_id, messages)
            redis_seeded += 1
        except Exception:
            logger.warning("Redis chat history yazılamadı: %s", session_id, exc_info=True)
    return len(scenarios), redis_seeded


async def _seed_audit_logs(session: AsyncSession, users: dict[str, User]) -> int:
    result = await session.execute(select(AuditLog).where(AuditLog.request_id.like("seed-demo-%")))
    for log in result.scalars().all():
        await session.delete(log)
    await session.flush()

    actor = users[ADMIN_EMAIL]
    specs = [
        (users[ADMIN_EMAIL], "LOGIN_SUCCESS", "user", str(users[ADMIN_EMAIL].id), None, {"email": ADMIN_EMAIL}),
        (actor, "ORDER_STATUS_UPDATED", "order", "KOBI-DEMO-0003", {"status": "processing"}, {"status": "shipped"}),
        (actor, "INVENTORY_UPDATED", "inventory", "GDA-PUL-250", {"quantity": 7}, {"quantity": 4}),
        (None, "SYSTEM_SEED_COMPLETED", "seed", SEED_NAME, None, {"version": SEED_VERSION}),
    ]
    for index, (user, action, entity_type, entity_id, old_values, new_values) in enumerate(specs):
        created_at = _now() - timedelta(hours=index + 2)
        session.add(
            AuditLog(
                user_id=user.id if user else None,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                old_values=old_values,
                new_values=new_values,
                ip_address="127.0.0.1",
                user_agent="seed_all.py",
                request_id=f"seed-demo-{index + 1}",
                created_at=created_at,
                updated_at=created_at,
            )
        )
    await session.flush()
    return len(specs)


async def seed_database() -> dict[str, int]:
    session_factory = get_session_factory()
    async with session_factory() as session:
        async with session.begin():
            if await _seed_already_completed(session):
                logger.info("Seed daha once basariyla calismis; tekrar veri yazilmadi.")
                return {"skipped": 1, "reason": "already_seeded"}

            has_business_data = await _database_has_business_data(session)
            has_seed_fingerprint = await _database_has_seed_fingerprint(session)
            if has_business_data and not has_seed_fingerprint:
                logger.warning(
                    "Seed metadata bulunamadi ancak mevcut is verisi tespit edildi; demo seed otomatik olarak atlandi."
                )
                return {"skipped": 1, "reason": "existing_business_data"}

            users = await _upsert_users_and_addresses(session)
            people_by_email = {person.email: person for person in PEOPLE}
            customers = await _upsert_customers(session)
            products = await _upsert_products(session)
            orders = await _upsert_orders(
                session=session,
                users=users,
                people_by_email=people_by_email,
                products=products,
                actor=users[ADMIN_EMAIL],
            )
            shipments = await _upsert_shipments(session, orders)
            movement_count = await _seed_inventory_movements(session, products, orders, users[ADMIN_EMAIL])
            notification_count = await _seed_notifications(session, products, orders, shipments)
            conversation_count, redis_chat_count = await _seed_conversations(session, customers)
            audit_count = await _seed_audit_logs(session, users)

            summary = {
                "users": len(users),
                "customers": len(customers),
                "products": len(products),
                "orders": len(orders),
                "shipments": len(shipments),
                "inventory_movements": movement_count,
                "notifications": notification_count,
                "conversations": conversation_count,
                "redis_chat_histories": redis_chat_count,
                "audit_logs": audit_count,
            }
            await _record_seed_success(session, summary)
            logger.info("Seed tamamlandı: %s", summary)
            return summary


async def main() -> None:
    try:
        summary = await seed_database()
        print(json.dumps({"seed": SEED_NAME, "version": SEED_VERSION, "summary": summary}, ensure_ascii=False))
    finally:
        await close_db_connections()


if __name__ == "__main__":
    asyncio.run(main())