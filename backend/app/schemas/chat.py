# schemas/chat.py
# AI agent chat ve konuşma schema'ları.
# content gibi serbest metin alanları global sanitize ile temizlenir.

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import validate_sanitized_field


# ── Request Schemas ──────────────────────────────────────


class ChatMessageRequest(BaseModel):
    """POST /chat/message isteği."""

    session_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Konuşma oturum ID'si",
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Kullanıcı mesajı",
    )

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v: str) -> str:
        result = validate_sanitized_field(v)
        if result is None or result.strip() == "":
            raise ValueError("Mesaj içeriği boş olamaz.")
        return result


# ── Response Schemas ─────────────────────────────────────


class ChatResponse(BaseModel):
    """Agent chat yanıtı."""

    reply: str
    session_id: str


class ConversationResponse(BaseModel):
    """Konuşma oturumu response."""

    id: int
    session_id: str
    customer_id: int | None = None
    user_identifier: str | None = None
    channel: str
    status: str
    last_message_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationListResponse(BaseModel):
    """Konuşma listesi response (hafif)."""

    id: int
    session_id: str
    channel: str
    status: str
    last_message_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
