# workers/inventory_worker.py
# Kritik stok kayıtlarını tarayıp RabbitMQ kuyruğuna bildirim olarak yayınlayan worker.
# DB sorguları repository katmanı üzerinden yapılır.

import asyncio
import json

import aio_pika
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.logger import get_logger, setup_logging
from app.repositories.inventory_repository import InventoryRepository

settings = get_settings()
setup_logging(level=settings.LOG_LEVEL, json_output=settings.LOG_JSON)
logger = get_logger(__name__)

_QUEUE_NAME = "stok_uyarilari"


async def _list_low_stock_messages(session: AsyncSession) -> list[dict[str, object]]:
    inventory_repo = InventoryRepository(session)
    low_stock_items = await inventory_repo.get_low_stock_items()

    messages: list[dict[str, object]] = []
    for item in low_stock_items:
        product_name = item.product.name if item.product else f"Ürün #{item.product_id}"
        messages.append(
            {
                "urun": product_name,
                "mevcut_stok": item.quantity,
                "kritik_esik": item.low_stock_threshold,
                "uyari": "Stok kritik seviyenin altında!",
            }
        )
    return messages


async def check_inventory_and_notify() -> None:
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)

    async with connection:
        channel = await connection.channel()
        await channel.declare_queue(_QUEUE_NAME, durable=True)

        async with session_factory() as session:
            for message_data in await _list_low_stock_messages(session):
                await channel.default_exchange.publish(
                    aio_pika.Message(body=json.dumps(message_data).encode("utf-8")),
                    routing_key=_QUEUE_NAME,
                )
                logger.info(
                    "RabbitMQ'ya stok uyarısı gönderildi.",
                    extra={
                        "queue": _QUEUE_NAME,
                        "product_name": message_data["urun"],
                    },
                )

    await engine.dispose()


if __name__ == "__main__":
    logger.info("Stok worker başlatıldı.")
    asyncio.run(check_inventory_and_notify())
