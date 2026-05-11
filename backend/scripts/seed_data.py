# scripts/seed_data.py
# Geliştirme ve demo için örnek veri oluşturma scripti.
# Async SQLAlchemy session kullanır.
# Mevcut models ve security altyapısı ile uyumludur.
# İdempotent: tekrar çalıştırıldığında duplicate veri üretmez.
# Admin bilgisi .env üzerinden override edilebilir.
# print() yerine kontrollü çıktı üretimi (logging + stdout özet).

import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

# Proje root'unu sys.path'e ekle — script'in doğrudan çalışabilmesi için
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import get_logger, setup_logging
from app.core.security import hash_password
from app.db.session import get_db_session
from app.models.customer import Customer
from app.models.inventory import Inventory
from app.models.inventory_movement import InventoryMovement
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.order_status_history import OrderStatusHistory
from app.models.product import Product
from app.models.shipment import Shipment
from app.models.shipment_event import ShipmentEvent
from app.models.user import User

# ── Logger Setup ─────────────────────────────────────────

setup_logging(level="INFO", json_output=False)
logger = get_logger("seed_data")

# ── Seed Config ──────────────────────────────────────────

SEED_ADMIN_EMAIL = os.environ.get("SEED_ADMIN_EMAIL", "admin@kobi.local")
SEED_ADMIN_PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD", "Admin123!")
SEED_CUSTOMER_PASSWORD = os.environ.get("SEED_CUSTOMER_PASSWORD", "Customer123!")

# ── Ürün Verileri ────────────────────────────────────────
# Sadece birim bazlı satılan, demo için sade kadın kooperatifi ürünleri.
# Kategoriler frontend kategori yapısına uygun tutulmuştur:
# Baharatlar, Reçel, Zeytinyağı, Pekmez.

PRODUCTS_DATA: list[dict] = [
    {
        "name": "Nane 100 Gr",
        "sku": "BHR-001",
        "description": "Belen Kadın Kooperatifi üretimi kurutulmuş nane, 100 gram paket.",
        "price": Decimal("135.00"),
        "category": "Baharatlar",
    },
    {
        "name": "Acı Pul Biber 250 Gr",
        "sku": "BHR-002",
        "description": "Belen Kadın Kooperatifi üretimi acı pul biber, 250 gram paket.",
        "price": Decimal("203.00"),
        "category": "Baharatlar",
    },
    {
        "name": "Çilek Reçeli 460 Gr",
        "sku": "RCL-001",
        "description": "Rimmen Kadın Kooperatifi üretimi çilek reçeli, cam kavanozda 460 gram.",
        "price": Decimal("187.50"),
        "category": "Reçel",
    },
    {
        "name": "Zeytinyağı 750 Ml",
        "sku": "ZYT-001",
        "description": "Rimmen Kadın Kooperatifi üretimi zeytinyağı, cam şişede 750 ml.",
        "price": Decimal("432.00"),
        "category": "Zeytinyağı",
    },
    {
        "name": "Üzüm Pekmezi 400 Gr",
        "sku": "PKM-001",
        "description": "Defne Ağacı Kadın Kooperatifi üretimi üzüm pekmezi, cam kavanozda 400 gram.",
        "price": Decimal("195.00"),
        "category": "Pekmez",
    },
]

# Eski demo seed ürünleri varsa aktif listeden düşürmek için kullanılır.
# Silme yapılmaz; eski sipariş/fk güvenliği için yalnızca pasifleştirilir.
LEGACY_SEED_SKUS: set[str] = {
    "GDA-001",
    "GDA-002",
    "GDA-003",
    "GDA-004",
    "GDA-005",
    "GDA-006",
    "GDA-007",
    "GDA-008",
    "GDA-009",
    "GDA-010",
    "ELK-001",
    "ELK-002",
    "ELK-003",
    "ELK-004",
    "ELK-005",
    "OFS-001",
    "OFS-002",
    "OFS-003",
    "OFS-004",
    "AKS-001",
}

# ── Stok Miktarları ──────────────────────────────────────
# sku bazlı tutulur; ürün sırasına bağımlı değildir.
# PKM-001 bilinçli olarak kritik stok altında başlatılır.

INVENTORY_DATA: dict[str, dict] = {
    "BHR-001": {"quantity": 25, "low_stock_threshold": 8},
    "BHR-002": {"quantity": 18, "low_stock_threshold": 6},
    "RCL-001": {"quantity": 10, "low_stock_threshold": 5},
    "ZYT-001": {"quantity": 7, "low_stock_threshold": 4},
    "PKM-001": {"quantity": 3, "low_stock_threshold": 5},
}

# ── Müşteri Verileri ─────────────────────────────────────

CUSTOMERS_DATA: list[dict] = [
    {"full_name": "Ahmet Yılmaz", "phone": "05321234567", "email": "ahmet.yilmaz@example.com", "source_channel": "web"},
    {"full_name": "Fatma Kaya", "phone": "05339876543", "email": "fatma.kaya@example.com", "source_channel": "whatsapp"},
    {"full_name": "Mehmet Demir", "phone": "05441112233", "email": "mehmet.demir@example.com", "source_channel": "web"},
    {"full_name": "Ayşe Çelik", "phone": "05554443322", "email": "ayse.celik@example.com", "source_channel": "whatsapp"},
    {"full_name": "Mustafa Şahin", "phone": "05069998877", "email": "mustafa.sahin@example.com", "source_channel": "web"},
    {"full_name": "Zeynep Arslan", "phone": "05377776655", "email": "zeynep.arslan@example.com", "source_channel": "agent"},
    {"full_name": "Ali Öztürk", "phone": "05488885544", "email": "ali.ozturk@example.com", "source_channel": "web"},
    {"full_name": "Hülya Koç", "phone": "05311223344", "email": "hulya.koc@example.com", "source_channel": "whatsapp"},
    {"full_name": "İbrahim Aydın", "phone": "05425556677", "email": "ibrahim.aydin@example.com", "source_channel": "web"},
    {"full_name": "Elif Yıldız", "phone": "05536667788", "email": "elif.yildiz@example.com", "source_channel": "agent"},
    {"full_name": "Osman Doğan", "phone": "05447778899", "email": "osman.dogan@example.com", "source_channel": "web"},
    {"full_name": "Seda Aksoy", "phone": "05058889900", "email": "seda.aksoy@example.com", "source_channel": "whatsapp"},
    {"full_name": "Kadir Yüksel", "phone": "05369990011", "email": "kadir.yuksel@example.com", "source_channel": "web"},
    {"full_name": "Büşra Polat", "phone": "05471110022", "email": "busra.polat@example.com", "source_channel": "agent"},
    {"full_name": "Emre Acar", "phone": "05302220033", "email": "emre.acar@example.com", "source_channel": "web"},
]


# ── Helpers ──────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _days_ago(days: int) -> datetime:
    return _now() - timedelta(days=days)


# ── Seed Functions ───────────────────────────────────────


async def _seed_admin(session: AsyncSession) -> User | None:
    """Admin kullanıcıyı oluşturur. Zaten varsa atlar."""
    result = await session.execute(
        select(User).where(User.email == SEED_ADMIN_EMAIL)
    )
    existing = result.scalar_one_or_none()

    if existing is not None:
        logger.info("Admin kullanıcı zaten mevcut, atlanıyor: %s", SEED_ADMIN_EMAIL)
        return existing

    admin = User(
        email=SEED_ADMIN_EMAIL,
        hashed_password=hash_password(SEED_ADMIN_PASSWORD),
        full_name="Sistem Yöneticisi",
        role="admin",
        is_active=True,
    )
    session.add(admin)
    await session.flush()
    await session.refresh(admin)

    logger.info("Admin kullanıcı oluşturuldu: %s", SEED_ADMIN_EMAIL)
    return admin


async def _deactivate_legacy_seed_products(session: AsyncSession) -> int:
    """Eski demo seed ürünlerini silmeden pasifleştirir."""
    desired_skus = {product["sku"] for product in PRODUCTS_DATA}
    legacy_skus = LEGACY_SEED_SKUS - desired_skus

    if not legacy_skus:
        return 0

    result = await session.execute(
        select(Product).where(Product.sku.in_(legacy_skus))
    )
    legacy_products = list(result.scalars().all())

    count = 0
    for product in legacy_products:
        if product.is_active:
            product.is_active = False
            count += 1

    if count:
        await session.flush()
        logger.info("Pasifleştirilen eski demo ürün sayısı: %d", count)

    return count


async def _seed_products(session: AsyncSession) -> list[Product]:
    """Ürünleri ve stok kayıtlarını SKU bazlı idempotent şekilde oluşturur/günceller."""
    await _deactivate_legacy_seed_products(session)

    products: list[Product] = []
    inventory_count = 0

    for prod_data in PRODUCTS_DATA:
        result = await session.execute(
            select(Product).where(Product.sku == prod_data["sku"])
        )
        product = result.scalar_one_or_none()

        if product is None:
            product = Product(
                name=prod_data["name"],
                sku=prod_data["sku"],
                description=prod_data["description"],
                price=prod_data["price"],
                category=prod_data["category"],
                is_active=True,
            )
            session.add(product)
            await session.flush()
            await session.refresh(product)
            logger.info("Ürün oluşturuldu: %s", product.sku)
        else:
            product.name = prod_data["name"]
            product.description = prod_data["description"]
            product.price = prod_data["price"]
            product.category = prod_data["category"]
            product.is_active = True
            await session.flush()
            await session.refresh(product)
            logger.info("Ürün güncellendi: %s", product.sku)

        products.append(product)

        inv_data = INVENTORY_DATA[prod_data["sku"]]
        result = await session.execute(
            select(Inventory).where(Inventory.product_id == product.id)
        )
        inventory = result.scalar_one_or_none()

        if inventory is None:
            inventory = Inventory(
                product_id=product.id,
                quantity=inv_data["quantity"],
                reserved_quantity=0,
                low_stock_threshold=inv_data["low_stock_threshold"],
            )
            session.add(inventory)
            inventory_count += 1
            logger.info("Stok kaydı oluşturuldu: %s", product.sku)
        else:
            inventory.quantity = inv_data["quantity"]
            inventory.reserved_quantity = 0
            inventory.low_stock_threshold = inv_data["low_stock_threshold"]
            inventory_count += 1
            logger.info("Stok kaydı güncellendi: %s", product.sku)

        await session.flush()

    logger.info("Aktif seed ürün sayısı: %d", len(products))
    logger.info("Hazırlanan stok kaydı sayısı: %d", inventory_count)
    return products


async def _seed_customers(session: AsyncSession) -> list[Customer]:
    """Müşterileri oluşturur. Telefon ile duplicate kontrolü yapar."""
    result = await session.execute(select(Customer).limit(1))
    existing = result.scalar_one_or_none()

    if existing is not None:
        logger.info("Müşteriler zaten mevcut, atlanıyor.")
        result = await session.execute(select(Customer))
        return list(result.scalars().all())

    customers: list[Customer] = []
    for cust_data in CUSTOMERS_DATA:
        customer = Customer(
            full_name=cust_data["full_name"],
            phone=cust_data["phone"],
            email=cust_data["email"],
            source_channel=cust_data["source_channel"],
        )
        session.add(customer)
        await session.flush()
        await session.refresh(customer)
        customers.append(customer)

    logger.info("Oluşturulan müşteri sayısı: %d", len(customers))
    return customers


async def _seed_customer_users(
    session: AsyncSession,
    customers: list[Customer],
) -> dict[int, User]:
    """Legacy müşteri kayıtları için login olabilen customer user kayıtları oluşturur."""
    customer_users: dict[int, User] = {}

    for customer in customers:
        email = customer.email or f"seed-customer-{customer.id}@kobi.local"

        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()

        if existing is not None:
            if existing.role != "customer":
                logger.info(
                    "Mevcut user customer role değil, değiştirilmeden kullanılacak: %s",
                    existing.email,
                )
            customer_users[customer.id] = existing
            continue

        user = User(
            email=email,
            hashed_password=hash_password(SEED_CUSTOMER_PASSWORD),
            full_name=customer.full_name,
            role="customer",
            is_active=True,
        )
        session.add(user)
        await session.flush()
        await session.refresh(user)
        customer_users[customer.id] = user

    logger.info("Hazırlanan müşteri user sayısı: %d", len(customer_users))
    return customer_users


async def _seed_orders(
    session: AsyncSession,
    admin: User,
    customers: list[Customer],
    customer_users: dict[int, User],
    products: list[Product],
) -> list[Order]:
    """Sipariş, sipariş kalemleri ve ilişkili kayıtları oluşturur."""
    result = await session.execute(select(Order).limit(1))
    existing = result.scalar_one_or_none()

    if existing is not None:
        logger.info("Siparişler zaten mevcut, atlanıyor.")
        result = await session.execute(select(Order))
        return list(result.scalars().all())

    if not products:
        logger.warning("Ürün bulunamadı, sipariş oluşturma atlanıyor.")
        return []

    product_by_sku = {product.sku: product for product in products}

    # Sipariş tanımları:
    # (customer_idx, status, days_ago, items: [(sku, qty)])
    order_defs: list[tuple[int, str, int, list[tuple[str, int]]]] = [
        (0, "delivered", 10, [("BHR-001", 2), ("RCL-001", 1)]),
        (1, "delivered", 8, [("ZYT-001", 1), ("PKM-001", 2)]),
        (2, "shipped", 5, [("BHR-002", 2), ("RCL-001", 1)]),
        (3, "shipped", 4, [("BHR-001", 1), ("ZYT-001", 1)]),
        (4, "processing", 3, [("PKM-001", 1), ("BHR-002", 1)]),
        (5, "processing", 2, [("RCL-001", 2)]),
        (6, "pending", 1, [("ZYT-001", 1), ("BHR-001", 3)]),
        (7, "pending", 1, [("PKM-001", 1)]),
        (8, "pending", 0, [("BHR-002", 1), ("RCL-001", 1)]),
        (9, "cancelled", 6, [("BHR-001", 1)]),
        (10, "delivered", 12, [("ZYT-001", 1), ("RCL-001", 2)]),
        (11, "shipped", 3, [("PKM-001", 2), ("BHR-002", 1)]),
    ]

    orders: list[Order] = []
    total_items = 0
    total_movements = 0
    total_history = 0

    for order_idx, (cust_idx, status, days, items) in enumerate(order_defs):
        customer = customers[cust_idx % len(customers)]
        customer_user = customer_users[customer.id]
        placed_at = _days_ago(days)
        order_number = f"ORD-2026-{order_idx + 1:04d}"

        total = Decimal("0.00")
        for sku, qty in items:
            product = product_by_sku[sku]
            total += product.price * qty

        order = Order(
            order_number=order_number,
            customer_id=customer_user.id,
            status=status,
            total_amount=total,
            notes=f"Demo sipariş #{order_idx + 1}",
            shipping_full_name=customer.full_name,
            shipping_phone=customer.phone or "0000000000",
            shipping_address="Demo Mah. Kooperatif Sok. No: 1",
            shipping_city="İstanbul",
            shipping_district="Kadıköy",
            shipping_postal_code="34710",
            shipping_country="Türkiye",
            shipping_note=None,
            placed_at=placed_at,
            cancelled_at=placed_at + timedelta(hours=2) if status == "cancelled" else None,
        )
        session.add(order)
        await session.flush()
        await session.refresh(order)
        orders.append(order)

        for sku, qty in items:
            product = product_by_sku[sku]
            item_total = product.price * qty
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=product.price,
                total_price=item_total,
            )
            session.add(order_item)
            total_items += 1

        status_flow = _get_status_flow(status)
        for old_status, new_status in status_flow:
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_status,
                new_status=new_status,
                changed_by_user_id=admin.id,
                reason=f"Otomatik geçiş — {new_status}",
            )
            session.add(history)
            total_history += 1

        if status in ("shipped", "delivered", "processing"):
            for sku, qty in items:
                product = product_by_sku[sku]

                result = await session.execute(
                    select(Inventory).where(Inventory.product_id == product.id)
                )
                inventory = result.scalar_one_or_none()

                current_quantity = inventory.quantity if inventory is not None else 100
                previous_quantity = current_quantity + qty

                movement = InventoryMovement(
                    product_id=product.id,
                    order_id=order.id,
                    movement_type="order_deducted",
                    quantity_change=-qty,
                    previous_quantity=previous_quantity,
                    new_quantity=current_quantity,
                    reason=f"Sipariş #{order.order_number} düşümü — seed data",
                    created_by_user_id=admin.id,
                )
                session.add(movement)
                total_movements += 1

    await session.flush()

    logger.info("Oluşturulan sipariş sayısı: %d", len(orders))
    logger.info("Oluşturulan sipariş kalemi: %d", total_items)
    logger.info("Oluşturulan durum geçmişi: %d", total_history)
    logger.info("Oluşturulan stok hareketi: %d", total_movements)
    return orders


def _get_status_flow(final_status: str) -> list[tuple[str | None, str]]:
    """Sipariş statüsüne göre geçiş zincirini döndürür."""
    flows: dict[str, list[tuple[str | None, str]]] = {
        "pending": [(None, "pending")],
        "processing": [(None, "pending"), ("pending", "processing")],
        "shipped": [(None, "pending"), ("pending", "processing"), ("processing", "shipped")],
        "delivered": [
            (None, "pending"),
            ("pending", "processing"),
            ("processing", "shipped"),
            ("shipped", "delivered"),
        ],
        "cancelled": [(None, "pending"), ("pending", "cancelled")],
    }
    return flows.get(final_status, [(None, final_status)])


async def _seed_shipments(
    session: AsyncSession,
    orders: list[Order],
) -> int:
    """Sevk edilen ve teslim edilen siparişler için kargo ve olay kaydı oluşturur."""
    result = await session.execute(select(Shipment).limit(1))
    existing = result.scalar_one_or_none()

    if existing is not None:
        logger.info("Kargo kayıtları zaten mevcut, atlanıyor.")
        return 0

    shipment_count = 0
    event_count = 0

    for order in orders:
        if order.status not in ("shipped", "delivered"):
            continue

        tracking = f"YK{1000000 + order.id}"
        ship_status = "delivered" if order.status == "delivered" else "in_transit"

        shipment = Shipment(
            order_id=order.id,
            carrier="yurtici",
            tracking_number=tracking,
            status=ship_status,
            estimated_delivery_date=order.placed_at + timedelta(days=3),
            delivered_at=order.placed_at + timedelta(days=2, hours=14) if ship_status == "delivered" else None,
            last_checked_at=_now() - timedelta(hours=2),
        )
        session.add(shipment)
        await session.flush()
        await session.refresh(shipment)
        shipment_count += 1

        events_data = _get_shipment_events(shipment, order)
        for ev_data in events_data:
            event = ShipmentEvent(
                shipment_id=shipment.id,
                status=ev_data["status"],
                location=ev_data["location"],
                description=ev_data["description"],
                event_time=ev_data["event_time"],
            )
            session.add(event)
            event_count += 1

    await session.flush()

    logger.info("Oluşturulan kargo sayısı: %d", shipment_count)
    logger.info("Oluşturulan kargo olayı: %d", event_count)
    return shipment_count


def _get_shipment_events(shipment: Shipment, order: Order) -> list[dict]:
    """Kargo için olay geçmişi verileri üretir."""
    base_time = order.placed_at + timedelta(hours=4)
    events = [
        {
            "status": "created",
            "location": "İstanbul — Depo",
            "description": "Kargo oluşturuldu, paket hazırlanıyor.",
            "event_time": base_time,
        },
        {
            "status": "in_transit",
            "location": "İstanbul — Aktarma Merkezi",
            "description": "Kargo aktarma merkezine ulaştı.",
            "event_time": base_time + timedelta(hours=8),
        },
    ]

    if shipment.status == "delivered":
        events.append({
            "status": "in_transit",
            "location": "Ankara — Dağıtım Merkezi",
            "description": "Kargo dağıtım merkezine ulaştı.",
            "event_time": base_time + timedelta(days=1, hours=6),
        })
        events.append({
            "status": "delivered",
            "location": "Ankara",
            "description": "Kargo teslim edildi.",
            "event_time": base_time + timedelta(days=2, hours=10),
        })

    return events


async def _seed_initial_stock_movements(
    session: AsyncSession,
    admin: User,
) -> int:
    """Her aktif seed ürünü için başlangıç stok girişi hareketi oluşturur."""
    seed_skus = {product["sku"] for product in PRODUCTS_DATA}

    result = await session.execute(
        select(Product).where(Product.sku.in_(seed_skus))
    )
    products = list(result.scalars().all())

    result = await session.execute(select(Inventory))
    inventories = {inv.product_id: inv for inv in result.scalars().all()}

    count = 0
    for product in products:
        inv = inventories.get(product.id)
        if inv is None:
            continue

        result = await session.execute(
            select(InventoryMovement).where(
                InventoryMovement.product_id == product.id,
                InventoryMovement.movement_type == "stock_in",
            ).limit(1)
        )
        existing = result.scalar_one_or_none()

        if existing is not None:
            continue

        movement = InventoryMovement(
            product_id=product.id,
            order_id=None,
            movement_type="stock_in",
            quantity_change=inv.quantity,
            previous_quantity=0,
            new_quantity=inv.quantity,
            reason="Başlangıç stok girişi — seed data",
            created_by_user_id=admin.id,
        )
        session.add(movement)
        count += 1

    await session.flush()
    logger.info("Oluşturulan başlangıç stok hareketi: %d", count)
    return count


# ── Main Runner ──────────────────────────────────────────


async def run_seed() -> None:
    """Ana seed fonksiyonu. Tüm seed verilerini oluşturur."""
    logger.info("=" * 60)
    logger.info("Seed data oluşturma başlıyor...")
    logger.info("=" * 60)

    async for session in get_db_session():
        try:
            admin = await _seed_admin(session)
            if admin is None:
                logger.error("Admin kullanıcı oluşturulamadı.")
                return

            products = await _seed_products(session)

            customers = await _seed_customers(session)
            customer_users = await _seed_customer_users(session, customers)

            await _seed_initial_stock_movements(session, admin)

            orders = await _seed_orders(
                session=session,
                admin=admin,
                customers=customers,
                customer_users=customer_users,
                products=products,
            )

            await _seed_shipments(session, orders)

            logger.info("=" * 60)
            logger.info("Seed data başarıyla oluşturuldu!")
            logger.info("Admin: %s (development password ile giriş yapılabilir)", SEED_ADMIN_EMAIL)
            logger.info("Seed customer password: %s", SEED_CUSTOMER_PASSWORD)
            logger.info("=" * 60)

        except Exception:
            logger.exception("Seed data oluşturulurken hata oluştu.")
            raise


if __name__ == "__main__":
    asyncio.run(run_seed())