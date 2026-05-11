# scripts/seed_data.py
# Geliştirme ve demo için örnek veri oluşturma scripti.
# Async SQLAlchemy session kullanır.
# Mevcut models ve security altyapısı ile uyumludur.
# İdempotent: tekrar çalıştırıldığında duplicate veri üretmez (admin email kontrolü).
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
from app.models.shipment import Shipment
from app.models.shipment_event import ShipmentEvent
from app.models.user import User

# ── Logger Setup ─────────────────────────────────────────

setup_logging(level="INFO", json_output=False)
logger = get_logger("seed_data")

# ── Seed Config ──────────────────────────────────────────

SEED_ADMIN_EMAIL = os.environ.get("SEED_ADMIN_EMAIL", "admin@kobi.local")
SEED_ADMIN_PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD", "Admin123!")

# ── Ürün Verileri ────────────────────────────────────────

PRODUCTS_DATA: list[dict] = [
    {"name": "Domates", "sku": "GDA-001", "description": "Taze salkım domates, 1 kg", "price": Decimal("24.90"), "category": "Gıda"},
    {"name": "Salatalık", "sku": "GDA-002", "description": "Taze çıtır salatalık, 1 kg", "price": Decimal("18.50"), "category": "Gıda"},
    {"name": "Zeytinyağı (1L)", "sku": "GDA-003", "description": "Soğuk sıkım natürel sızma zeytinyağı", "price": Decimal("189.00"), "category": "Gıda"},
    {"name": "Peynir (500g)", "sku": "GDA-004", "description": "Taze beyaz peynir, inek sütünden", "price": Decimal("79.90"), "category": "Gıda"},
    {"name": "Bal (450g)", "sku": "GDA-005", "description": "Süzme çiçek balı, doğal", "price": Decimal("159.00"), "category": "Gıda"},
    {"name": "Çay (1kg)", "sku": "GDA-006", "description": "Rize çayı, siyah dökme çay", "price": Decimal("89.00"), "category": "Gıda"},
    {"name": "Un (5kg)", "sku": "GDA-007", "description": "Genel amaçlı buğday unu", "price": Decimal("54.90"), "category": "Gıda"},
    {"name": "Pirinç (2kg)", "sku": "GDA-008", "description": "Baldo pirinç, yerli üretim", "price": Decimal("69.90"), "category": "Gıda"},
    {"name": "Makarna (500g)", "sku": "GDA-009", "description": "Burgu makarna, durum buğdayı", "price": Decimal("14.90"), "category": "Gıda"},
    {"name": "Tereyağı (250g)", "sku": "GDA-010", "description": "Doğal inek tereyağı", "price": Decimal("64.90"), "category": "Gıda"},
    {"name": "Kablosuz Mouse", "sku": "ELK-001", "description": "Ergonomik kablosuz mouse, 2.4GHz", "price": Decimal("149.90"), "category": "Elektronik"},
    {"name": "USB-C Kablo (1m)", "sku": "ELK-002", "description": "Hızlı şarj uyumlu USB-C kablo", "price": Decimal("49.90"), "category": "Elektronik"},
    {"name": "Bluetooth Kulaklık", "sku": "ELK-003", "description": "Kulak üstü aktif gürültü engellemeli", "price": Decimal("599.00"), "category": "Elektronik"},
    {"name": "Powerbank 10000mAh", "sku": "ELK-004", "description": "Taşınabilir şarj cihazı, çift çıkış", "price": Decimal("299.90"), "category": "Elektronik"},
    {"name": "LED Masa Lambası", "sku": "ELK-005", "description": "Ayarlanabilir ışık, göz koruma", "price": Decimal("189.90"), "category": "Elektronik"},
    {"name": "A4 Fotokopi Kağıdı (500 yaprak)", "sku": "OFS-001", "description": "80gr beyaz kağıt", "price": Decimal("84.90"), "category": "Ofis"},
    {"name": "Tükenmez Kalem (10lu)", "sku": "OFS-002", "description": "Mavi tükenmez kalem seti", "price": Decimal("29.90"), "category": "Ofis"},
    {"name": "Dosya Klasörü", "sku": "OFS-003", "description": "A4 geniş kapasiteli plastik klasör", "price": Decimal("24.90"), "category": "Ofis"},
    {"name": "Post-it Not (5 renk)", "sku": "OFS-004", "description": "Yapışkanlı not kağıdı seti, 5x100 yaprak", "price": Decimal("39.90"), "category": "Ofis"},
    {"name": "Silikon Kılıf (Telefon)", "sku": "AKS-001", "description": "Şeffaf telefon kılıfı, darbe emici", "price": Decimal("59.90"), "category": "Aksesuar"},
]

# ── Stok Miktarları ──────────────────────────────────────
# İndeksi ürün sırasıyla eşleşir. Bazıları düşük stok.

INVENTORY_DATA: list[dict] = [
    {"quantity": 150, "low_stock_threshold": 20},   # Domates
    {"quantity": 80, "low_stock_threshold": 15},     # Salatalık
    {"quantity": 45, "low_stock_threshold": 10},     # Zeytinyağı
    {"quantity": 60, "low_stock_threshold": 10},     # Peynir
    {"quantity": 8, "low_stock_threshold": 10},      # Bal — DÜŞÜK STOK
    {"quantity": 35, "low_stock_threshold": 15},     # Çay
    {"quantity": 5, "low_stock_threshold": 10},      # Un — DÜŞÜK STOK
    {"quantity": 40, "low_stock_threshold": 10},     # Pirinç
    {"quantity": 200, "low_stock_threshold": 30},    # Makarna
    {"quantity": 3, "low_stock_threshold": 10},      # Tereyağı — DÜŞÜK STOK
    {"quantity": 25, "low_stock_threshold": 5},      # Mouse
    {"quantity": 100, "low_stock_threshold": 20},    # USB-C Kablo
    {"quantity": 12, "low_stock_threshold": 5},      # Kulaklık
    {"quantity": 7, "low_stock_threshold": 5},       # Powerbank
    {"quantity": 18, "low_stock_threshold": 5},      # Lamba
    {"quantity": 300, "low_stock_threshold": 50},    # Kağıt
    {"quantity": 150, "low_stock_threshold": 20},    # Kalem
    {"quantity": 2, "low_stock_threshold": 5},       # Klasör — DÜŞÜK STOK
    {"quantity": 90, "low_stock_threshold": 15},     # Post-it
    {"quantity": 55, "low_stock_threshold": 10},     # Kılıf
]

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


async def _seed_products(session: AsyncSession) -> list:
    """Ürünleri oluşturur. SKU ile duplicate kontrolü yapar."""
    # Mevcut SKU'ları kontrol et
    result = await session.execute(select(User).limit(1))  # simple check
    result = await session.execute(
        select(Inventory).limit(1)
    )
    existing_inv = result.scalar_one_or_none()
    if existing_inv is not None:
        logger.info("Ürünler zaten mevcut, atlanıyor.")
        # Mevcut ürünleri döndür
        result = await session.execute(select(Inventory))
        return list(result.scalars().all())

    products = []
    inventories = []
    for idx, prod_data in enumerate(PRODUCTS_DATA):
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
        products.append(product)

        # Stok kaydı oluştur
        inv_data = INVENTORY_DATA[idx]
        inventory = Inventory(
            product_id=product.id,
            quantity=inv_data["quantity"],
            reserved_quantity=0,
            low_stock_threshold=inv_data["low_stock_threshold"],
        )
        session.add(inventory)
        await session.flush()
        await session.refresh(inventory)
        inventories.append(inventory)

    logger.info("Oluşturulan ürün sayısı: %d", len(products))
    logger.info("Oluşturulan stok kaydı: %d", len(inventories))
    return products


async def _seed_customers(session: AsyncSession) -> list[Customer]:
    """Müşterileri oluşturur. Telefon ile duplicate kontrolü yapar."""
    result = await session.execute(select(Customer).limit(1))
    existing = result.scalar_one_or_none()
    if existing is not None:
        logger.info("Müşteriler zaten mevcut, atlanıyor.")
        result = await session.execute(select(Customer))
        return list(result.scalars().all())

    customers = []
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


async def _seed_customer_users(session: AsyncSession, customers: list[Customer]) -> dict[int, User]:
    """Legacy müşteri kayıtları için login olabilen customer user kayıtları oluşturur."""
    customer_users: dict[int, User] = {}

    for customer in customers:
        email = customer.email or f"seed-customer-{customer.id}@kobi.local"
        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        if existing is not None:
            customer_users[customer.id] = existing
            continue

        user = User(
            email=email,
            hashed_password=hash_password("Customer123!"),
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
    products: list,
) -> list[Order]:
    """Sipariş, sipariş kalemleri ve ilişkili kayıtları oluşturur."""
    result = await session.execute(select(Order).limit(1))
    existing = result.scalar_one_or_none()
    if existing is not None:
        logger.info("Siparişler zaten mevcut, atlanıyor.")
        result = await session.execute(select(Order))
        return list(result.scalars().all())

    # Ürünleri DB'den çek (gerçek product nesneleri)
    result = await session.execute(select(Product))
    db_products = list(result.scalars().all())

    if not db_products:
        logger.warning("Ürün bulunamadı, sipariş oluşturma atlanıyor.")
        return []

    # Sipariş tanımları: (customer_idx, status, days_ago, items: [(product_idx, qty)])
    order_defs: list[tuple[int, str, int, list[tuple[int, int]]]] = [
        (0, "delivered", 10, [(0, 3), (2, 1)]),
        (1, "delivered", 8, [(3, 2), (5, 1)]),
        (2, "shipped", 5, [(10, 1), (11, 2)]),
        (3, "shipped", 4, [(6, 2), (7, 1), (8, 3)]),
        (4, "processing", 3, [(12, 1)]),
        (5, "processing", 2, [(14, 2), (15, 1)]),
        (6, "pending", 1, [(1, 5), (9, 2)]),
        (7, "pending", 1, [(4, 1), (16, 3)]),
        (8, "pending", 0, [(17, 2), (18, 1)]),
        (9, "cancelled", 6, [(19, 4)]),
        (10, "delivered", 12, [(0, 2), (3, 1), (5, 2)]),
        (11, "shipped", 3, [(13, 1), (11, 3)]),
    ]

    orders = []
    total_items = 0
    total_movements = 0
    total_history = 0

    for order_idx, (cust_idx, status, days, items) in enumerate(order_defs):
        customer = customers[cust_idx % len(customers)]
        customer_user = customer_users[customer.id]
        placed_at = _days_ago(days)

        # Sipariş numarası
        order_number = f"ORD-2026-{order_idx + 1:04d}"

        # Toplam tutar hesapla
        total = Decimal("0.00")
        for prod_idx, qty in items:
            product = db_products[prod_idx % len(db_products)]
            total += product.price * qty

        order = Order(
            order_number=order_number,
            customer_id=customer_user.id,
            status=status,
            total_amount=total,
            notes=f"Demo sipariş #{order_idx + 1}",
            shipping_full_name=customer.full_name,
            shipping_phone=customer.phone or "0000000000",
            shipping_address="Demo Mah. Örnek Sok. No: 1",
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

        # Sipariş kalemleri
        for prod_idx, qty in items:
            product = db_products[prod_idx % len(db_products)]
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

        # Sipariş durum geçmişi
        status_flow = _get_status_flow(status)
        for flow_idx, (old_st, new_st) in enumerate(status_flow):
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_st,
                new_status=new_st,
                changed_by_user_id=admin.id,
                reason=f"Otomatik geçiş — {new_st}",
            )
            session.add(history)
            total_history += 1

        # Stok hareketleri (teslim edilen ve sevk edilen siparişler için)
        if status in ("shipped", "delivered", "processing"):
            for prod_idx, qty in items:
                product = db_products[prod_idx % len(db_products)]
                movement = InventoryMovement(
                    product_id=product.id,
                    order_id=order.id,
                    movement_type="order_deducted",
                    quantity_change=-qty,
                    previous_quantity=100,  # Demo değer
                    new_quantity=100 - qty,
                    reason=f"Sipariş #{order.order_number} düşümü",
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

        if order.status == "delivered":
            ship_status = "delivered"
        else:
            ship_status = "in_transit"

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

        # Kargo olayları
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
    """Her ürün için başlangıç stok girişi hareketi oluşturur."""
    result = await session.execute(
        select(InventoryMovement).where(
            InventoryMovement.movement_type == "stock_in"
        ).limit(1)
    )
    existing = result.scalar_one_or_none()
    if existing is not None:
        logger.info("Başlangıç stok hareketleri zaten mevcut, atlanıyor.")
        return 0

    result = await session.execute(select(Product))
    products = list(result.scalars().all())

    result = await session.execute(select(Inventory))
    inventories = {inv.product_id: inv for inv in result.scalars().all()}

    count = 0
    for product in products:
        inv = inventories.get(product.id)
        if inv is None:
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


# ── Import Product model lazily to avoid issues ──────────
from app.models.product import Product  # noqa: E402


# ── Main Runner ──────────────────────────────────────────


async def run_seed() -> None:
    """Ana seed fonksiyonu. Tüm seed verilerini oluşturur."""
    logger.info("=" * 60)
    logger.info("Seed data oluşturma başlıyor...")
    logger.info("=" * 60)

    async for session in get_db_session():
        try:
            # 1. Admin kullanıcı
            admin = await _seed_admin(session)
            if admin is None:
                logger.error("Admin kullanıcı oluşturulamadı.")
                return

            # 2. Ürünler + Stok
            await _seed_products(session)

            # 3. Müşteriler
            customers = await _seed_customers(session)
            customer_users = await _seed_customer_users(session, customers)

            # 4. Başlangıç stok hareketleri
            await _seed_initial_stock_movements(session, admin)

            # 5. Siparişler (kalem, durum geçişi, stok hareketi dahil)
            # Ürünleri DB'den çek
            result = await session.execute(select(Product))
            db_products = list(result.scalars().all())
            orders = await _seed_orders(session, admin, customers, customer_users, db_products)

            # 6. Kargolar
            await _seed_shipments(session, orders)

            # Session commit get_db_session dependency'si tarafından yapılır
            logger.info("=" * 60)
            logger.info("Seed data başarıyla oluşturuldu!")
            logger.info("Admin: %s (development password ile giriş yapılabilir)", SEED_ADMIN_EMAIL)
            logger.info("=" * 60)

        except Exception:
            logger.exception("Seed data oluşturulurken hata oluştu.")
            raise


if __name__ == "__main__":
    asyncio.run(run_seed())
