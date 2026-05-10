# models/base_model.py
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

class TimestampMixin:
    """Oluşturulma ve güncellenme tarihlerini otomatik ekleyen mixin."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        sort_order=998
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        sort_order=999
    )

class IDMixin:
    """Otomatik artan integer ID ekleyen mixin."""
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, sort_order=-1)
