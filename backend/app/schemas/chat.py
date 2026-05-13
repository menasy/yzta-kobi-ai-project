# schemas/chat.py
# AI agent chat ve konuşma schema'ları.
# content gibi serbest metin alanları global sanitize ile temizlenir.

from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator

from app.core import openapi_examples
from .common import validate_sanitized_field


# ── Request Schemas ──────────────────────────────────────


class ChatMessageRequest(BaseModel):
    """POST /chat/message isteği."""

    session_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        pattern=r"^[a-zA-Z0-9\-_]{1,100}$",
        description="Konuşma oturum ID'si",
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Kullanıcı mesajı",
        validation_alias=AliasChoices("content", "message"),
    )

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v: str) -> str:
        result = validate_sanitized_field(v)
        if result is None or result.strip() == "":
            raise ValueError("Mesaj içeriği boş olamaz.")
        return result

    model_config = ConfigDict(
        json_schema_extra={"example": openapi_examples.CHAT_MESSAGE_REQUEST_EXAMPLE}
    )


class CreateConversationRequest(BaseModel):
    """POST /chat/conversations isteği."""
    title: str | None = Field(None, max_length=255, description="Sohbet başlığı (opsiyonel)")


# ── Response Schemas ─────────────────────────────────────


class ChatResponse(BaseModel):
    """Agent chat yanıtı."""

    reply: str
    session_id: str

    model_config = ConfigDict(
        json_schema_extra={"example": openapi_examples.CHAT_RESPONSE_EXAMPLE}
    )


class ConversationResponse(BaseModel):
    """Konuşma oturumu response (detaylı)."""

    id: int
    session_id: str
    user_id: int | None = None
    customer_id: int | None = None
    title: str | None = None
    last_message_preview: str | None = None
    message_count: int = 0
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
    title: str | None = None
    last_message_preview: str | None = None
    message_count: int = 0
    channel: str
    status: str
    last_message_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationMessageResponse(BaseModel):
    """Tek mesaj response."""

    id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationWithMessagesResponse(BaseModel):
    """Konuşma detayı + mesajlar response."""

    conversation: ConversationResponse
    messages: list[ConversationMessageResponse]
