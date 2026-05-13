"""customer_direct_checkout_orders

Revision ID: b8e4f1a2c9d3
Revises: 51ba577f6d32
Create Date: 2026-05-11 15:20:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b8e4f1a2c9d3"
down_revision: str | Sequence[str] | None = "51ba577f6d32"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


PLACEHOLDER_PASSWORD_HASH = "$2b$12$dNQfqC6URouKmdmxzDILUOJr7N3bBMrV.N/xSTxGnFP1RYTJ2erE6"
PLACEHOLDER_EMAIL_DOMAIN = "placeholder.kobi.local"


orders_table = sa.table(
    "orders",
    sa.column("id", sa.Integer),
    sa.column("customer_id", sa.Integer),
    sa.column("shipping_full_name", sa.String),
    sa.column("shipping_phone", sa.String),
    sa.column("shipping_address", sa.String),
    sa.column("shipping_city", sa.String),
    sa.column("shipping_district", sa.String),
    sa.column("shipping_postal_code", sa.String),
    sa.column("shipping_country", sa.String),
    sa.column("shipping_note", sa.String),
)

customers_table = sa.table(
    "customers",
    sa.column("id", sa.Integer),
    sa.column("full_name", sa.String),
    sa.column("phone", sa.String),
    sa.column("email", sa.String),
    sa.column("source_channel", sa.String),
    sa.column("is_active", sa.Boolean),
)

users_table = sa.table(
    "users",
    sa.column("id", sa.Integer),
    sa.column("email", sa.String),
    sa.column("hashed_password", sa.String),
    sa.column("full_name", sa.String),
    sa.column("role", sa.String),
    sa.column("is_active", sa.Boolean),
)


def _drop_fk_to(table_name: str, referred_table: str, constrained_columns: list[str]) -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    for fk in inspector.get_foreign_keys(table_name):
        if fk.get("referred_table") == referred_table and fk.get("constrained_columns") == constrained_columns:
            op.drop_constraint(fk["name"], table_name, type_="foreignkey")
            return


def _legacy_placeholder_email(customer_id: int) -> str:
    return f"legacy-customer-{customer_id}@{PLACEHOLDER_EMAIL_DOMAIN}"


def _ensure_placeholder_user(customer_id: int, full_name: str) -> int:
    bind = op.get_bind()
    email = _legacy_placeholder_email(customer_id)
    existing_id = bind.execute(sa.select(users_table.c.id).where(users_table.c.email == email)).scalar_one_or_none()
    if existing_id is not None:
        return int(existing_id)

    new_id = bind.execute(
        sa.insert(users_table)
        .values(
            email=email,
            hashed_password=PLACEHOLDER_PASSWORD_HASH,
            full_name=full_name,
            role="customer",
            is_active=False,
        )
        .returning(users_table.c.id)
    ).scalar_one()
    return int(new_id)


def _placeholder_customer_id_from_email(email: str | None) -> int | None:
    if not email:
        return None
    prefix = "legacy-customer-"
    suffix = f"@{PLACEHOLDER_EMAIL_DOMAIN}"
    if not email.startswith(prefix) or not email.endswith(suffix):
        return None
    raw_id = email.removeprefix(prefix).removesuffix(suffix)
    return int(raw_id) if raw_id.isdigit() else None


def _ensure_legacy_customer(user_id: int) -> int:
    bind = op.get_bind()
    user = (
        bind.execute(sa.select(users_table.c.email, users_table.c.full_name).where(users_table.c.id == user_id))
        .mappings()
        .first()
    )

    user_email = user["email"] if user else None
    placeholder_customer_id = _placeholder_customer_id_from_email(user_email)
    if placeholder_customer_id is not None:
        existing_id = bind.execute(
            sa.select(customers_table.c.id).where(customers_table.c.id == placeholder_customer_id)
        ).scalar_one_or_none()
        if existing_id is not None:
            return int(existing_id)

    if user_email:
        existing_by_email = bind.execute(
            sa.select(customers_table.c.id).where(customers_table.c.email == user_email).limit(1)
        ).scalar_one_or_none()
        if existing_by_email is not None:
            return int(existing_by_email)

    full_name = user["full_name"] if user and user["full_name"] else f"Kullanıcı #{user_id}"
    new_id = bind.execute(
        sa.insert(customers_table)
        .values(
            full_name=full_name,
            phone=None,
            email=user_email,
            source_channel="web",
            is_active=False,
        )
        .returning(customers_table.c.id)
    ).scalar_one()
    return int(new_id)


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    op.add_column("orders", sa.Column("shipping_full_name", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("shipping_phone", sa.String(length=20), nullable=True))
    op.add_column("orders", sa.Column("shipping_address", sa.String(length=1000), nullable=True))
    op.add_column("orders", sa.Column("shipping_city", sa.String(length=100), nullable=True))
    op.add_column("orders", sa.Column("shipping_district", sa.String(length=100), nullable=True))
    op.add_column("orders", sa.Column("shipping_postal_code", sa.String(length=20), nullable=True))
    op.add_column(
        "orders",
        sa.Column("shipping_country", sa.String(length=100), server_default="Türkiye", nullable=True),
    )
    op.add_column("orders", sa.Column("shipping_note", sa.String(length=1000), nullable=True))

    legacy_customer_ids = [
        int(row[0])
        for row in bind.execute(sa.select(orders_table.c.customer_id).distinct()).all()
        if row[0] is not None
    ]

    for legacy_customer_id in legacy_customer_ids:
        customer = (
            bind.execute(
                sa.select(
                    customers_table.c.full_name,
                    customers_table.c.phone,
                ).where(customers_table.c.id == legacy_customer_id)
            )
            .mappings()
            .first()
        )

        full_name = customer["full_name"] if customer and customer["full_name"] else f"Müşteri #{legacy_customer_id}"
        phone = customer["phone"] if customer and customer["phone"] else "0000000000"

        bind.execute(
            sa.update(orders_table)
            .where(orders_table.c.customer_id == legacy_customer_id)
            .values(
                shipping_full_name=full_name,
                shipping_phone=phone,
                shipping_address="Adres bilgisi mevcut değil",
                shipping_city="Belirtilmedi",
                shipping_district="Belirtilmedi",
                shipping_country="Türkiye",
            )
        )

    bind.execute(
        sa.update(orders_table).where(orders_table.c.shipping_full_name.is_(None)).values(shipping_full_name="Müşteri")
    )
    bind.execute(
        sa.update(orders_table).where(orders_table.c.shipping_phone.is_(None)).values(shipping_phone="0000000000")
    )
    bind.execute(
        sa.update(orders_table)
        .where(orders_table.c.shipping_address.is_(None))
        .values(shipping_address="Adres bilgisi mevcut değil")
    )
    bind.execute(
        sa.update(orders_table).where(orders_table.c.shipping_city.is_(None)).values(shipping_city="Belirtilmedi")
    )
    bind.execute(
        sa.update(orders_table)
        .where(orders_table.c.shipping_district.is_(None))
        .values(shipping_district="Belirtilmedi")
    )
    bind.execute(
        sa.update(orders_table).where(orders_table.c.shipping_country.is_(None)).values(shipping_country="Türkiye")
    )

    _drop_fk_to("orders", "customers", ["customer_id"])

    for legacy_customer_id in legacy_customer_ids:
        bind.execute(
            sa.update(orders_table)
            .where(orders_table.c.customer_id == legacy_customer_id)
            .values(customer_id=-legacy_customer_id)
        )

    for legacy_customer_id in legacy_customer_ids:
        customer = (
            bind.execute(sa.select(customers_table.c.full_name).where(customers_table.c.id == legacy_customer_id))
            .mappings()
            .first()
        )
        full_name = customer["full_name"] if customer and customer["full_name"] else f"Müşteri #{legacy_customer_id}"
        user_id = _ensure_placeholder_user(legacy_customer_id, full_name)
        bind.execute(
            sa.update(orders_table).where(orders_table.c.customer_id == -legacy_customer_id).values(customer_id=user_id)
        )

    op.create_foreign_key("orders_customer_id_users_fkey", "orders", "users", ["customer_id"], ["id"])

    op.alter_column("orders", "shipping_full_name", existing_type=sa.String(length=255), nullable=False)
    op.alter_column("orders", "shipping_phone", existing_type=sa.String(length=20), nullable=False)
    op.alter_column("orders", "shipping_address", existing_type=sa.String(length=1000), nullable=False)
    op.alter_column("orders", "shipping_city", existing_type=sa.String(length=100), nullable=False)
    op.alter_column("orders", "shipping_district", existing_type=sa.String(length=100), nullable=False)
    op.alter_column("orders", "shipping_country", existing_type=sa.String(length=100), nullable=False)
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(length=50),
        server_default="customer",
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()

    user_ids = [
        int(row[0])
        for row in bind.execute(sa.select(orders_table.c.customer_id).distinct()).all()
        if row[0] is not None
    ]

    _drop_fk_to("orders", "users", ["customer_id"])

    for user_id in user_ids:
        bind.execute(sa.update(orders_table).where(orders_table.c.customer_id == user_id).values(customer_id=-user_id))

    for user_id in user_ids:
        customer_id = _ensure_legacy_customer(user_id)
        bind.execute(
            sa.update(orders_table).where(orders_table.c.customer_id == -user_id).values(customer_id=customer_id)
        )

    op.create_foreign_key("orders_customer_id_fkey", "orders", "customers", ["customer_id"], ["id"])

    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(length=50),
        server_default="admin",
        existing_nullable=False,
    )
    op.drop_column("orders", "shipping_note")
    op.drop_column("orders", "shipping_country")
    op.drop_column("orders", "shipping_postal_code")
    op.drop_column("orders", "shipping_district")
    op.drop_column("orders", "shipping_city")
    op.drop_column("orders", "shipping_address")
    op.drop_column("orders", "shipping_phone")
    op.drop_column("orders", "shipping_full_name")
