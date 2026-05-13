# api/endpoints/chat.py
# AI Agent chat endpointleri.
# Kalıcı sohbet geçmişi: PostgreSQL + Redis uyumlu.
# Tüm endpoint'lerde user ownership kontrolü zorunlu.

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Request
from sqlalchemy.exc import SQLAlchemyError

from app.agent.context import AgentContext
from app.agent.orchestrator import AgentOrchestrator
from app.core import openapi_examples, openapi_responses
from app.core.dependencies import CurrentUser, DBSession, get_agent_orchestrator
from app.core.exceptions import (
    AppException,
    ExternalServiceError,
    ForbiddenError,
    NotFoundError,
    RateLimitError,
)
from app.core.logger import get_logger
from app.core.rate_limit import enforce_chat_message_rate_limit
from app.core.response_builder import success_response
from app.schemas.chat import (
    ChatMessageRequest,
    ChatResponse,
    ConversationListResponse,
    ConversationMessageResponse,
    ConversationResponse,
    ConversationWithMessagesResponse,
    CreateConversationRequest,
)
from app.services.chat_history_service import ConversationService

router = APIRouter()
logger = get_logger(__name__)


def _chat_reply_response(
    *,
    session_id: str,
    reply: str,
    key: str,
    message: str,
    metadata: dict | None = None,
):
    """Chat UI'nin kullanıcıyı yanıtsız bırakmaması için typed reply döndürür."""
    return success_response(
        data=ChatResponse(reply=reply, session_id=session_id, metadata=metadata).model_dump(mode="json"),
        message=message,
        key=key,
    )


def _app_exception_reply(exc: AppException) -> str:
    if isinstance(exc, ForbiddenError):
        return (
            "Bu sohbet oturumu hesabınızla eşleşmiyor. "
            "Lütfen yeni bir sohbet başlatın veya kendi sohbet geçmişinizden bir oturum seçin."
        )

    if isinstance(exc, NotFoundError):
        return (
            "Bu sohbet oturumunu bulamadım. Silinmiş veya süresi dolmuş olabilir. "
            "Yeni bir sohbet başlatıp tekrar deneyebilirsiniz."
        )

    if isinstance(exc, RateLimitError):
        return exc.message

    return exc.message or "İsteği işlerken bir uygulama hatası oluştu."


def _get_conversation_service(db: DBSession) -> ConversationService:
    """ConversationService dependency."""
    return ConversationService(db=db)


# ── Conversation CRUD Endpointleri ───────────────────────


@router.post(
    "/conversations",
    response_model=None,
    summary="Yeni sohbet oluştur",
    description="Authenticated kullanıcı için yeni bir sohbet oturumu oluşturur.",
    responses={
        201: {
            "description": "Sohbet başarıyla oluşturuldu.",
        },
        **openapi_responses.unauthorized_response(),
    },
)
async def create_conversation(
    current_user: CurrentUser,
    payload: CreateConversationRequest | None = None,
    service: ConversationService = Depends(_get_conversation_service),
):
    """POST /api/chat/conversations"""
    title = payload.title if payload else None
    conv = await service.create_conversation(user_id=current_user.id, title=title)

    return success_response(
        data=ConversationResponse.model_validate(conv).model_dump(mode="json"),
        message="Sohbet başarıyla oluşturuldu.",
        key="CHAT_CONVERSATION_CREATED",
        status_code=201,
    )


@router.get(
    "/conversations",
    response_model=None,
    summary="Sohbet listesini getir",
    description="Authenticated kullanıcının kendi sohbet oturumlarını listeler.",
    responses={
        200: {
            "description": "Sohbet listesi başarıyla getirildi.",
        },
        **openapi_responses.unauthorized_response(),
    },
)
async def list_conversations(
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 30,
    service: ConversationService = Depends(_get_conversation_service),
):
    """GET /api/chat/conversations"""
    conversations = await service.list_conversations(
        user_id=current_user.id, skip=skip, limit=limit
    )

    data = [
        ConversationListResponse.model_validate(c).model_dump(mode="json")
        for c in conversations
    ]

    return success_response(
        data=data,
        message="Sohbet listesi başarıyla getirildi.",
        key="CHAT_CONVERSATIONS_LISTED",
    )


@router.get(
    "/conversations/{session_id}",
    response_model=None,
    summary="Sohbet detayını getir",
    description="Belirtilen sohbetin metadata ve mesaj geçmişini getirir. Sadece sahibi erişebilir.",
    responses={
        200: {
            "description": "Sohbet detayı başarıyla getirildi.",
        },
        **openapi_responses.unauthorized_response(),
        404: {"description": "Sohbet bulunamadı."},
    },
)
async def get_conversation_detail(
    session_id: Annotated[str, Path(pattern=r"^[a-zA-Z0-9\-_]{1,100}$")],
    current_user: CurrentUser,
    service: Annotated[ConversationService, Depends(_get_conversation_service)],
):
    """GET /api/chat/conversations/{session_id}"""
    result = await service.get_conversation_with_messages(
        session_id=session_id, user_id=current_user.id
    )

    data = ConversationWithMessagesResponse(
        conversation=ConversationResponse.model_validate(result["conversation"]),
        messages=[
            ConversationMessageResponse.model_validate(m)
            for m in result["messages"]
        ],
    ).model_dump(mode="json")

    return success_response(
        data=data,
        message="Sohbet detayı başarıyla getirildi.",
        key="CHAT_CONVERSATION_DETAIL",
    )


@router.delete(
    "/conversations/{session_id}",
    response_model=None,
    summary="Sohbeti sil",
    description="Belirtilen sohbeti soft delete eder ve Redis memory'yi temizler. Sadece sahibi silebilir.",
    responses={
        200: {
            "description": "Sohbet başarıyla silindi.",
        },
        **openapi_responses.unauthorized_response(),
        404: {"description": "Sohbet bulunamadı."},
    },
)
async def delete_conversation(
    session_id: Annotated[str, Path(pattern=r"^[a-zA-Z0-9\-_]{1,100}$")],
    current_user: CurrentUser,
    service: Annotated[ConversationService, Depends(_get_conversation_service)],
):
    """DELETE /api/chat/conversations/{session_id}"""
    await service.delete_conversation(session_id=session_id, user_id=current_user.id)

    return success_response(
        data={"session_id": session_id},
        message="Sohbet başarıyla silindi.",
        key="CHAT_CONVERSATION_DELETED",
    )


# ── Mesaj Gönderim Endpointi ─────────────────────────────

@router.post(
    "/message",
    response_model=None,
    summary="Agent'a mesaj gönder",
    description="Kullanıcı mesajını AI agent'a iletir ve yanıt alır. Mesajlar kalıcı olarak kaydedilir.",
    responses={
        200: {
            "description": "Agent yanıtı başarıyla oluşturuldu.",
            "content": openapi_examples.example_content(
                data=openapi_examples.CHAT_RESPONSE_EXAMPLE,
                message="Agent yanıtı alındı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        429: {
            "description": "Rate limit aşıldı.",
            "content": {"application/json": {"example": openapi_examples.RATE_LIMIT_RESPONSE}},
        },
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def send_message(
    payload: ChatMessageRequest,
    request: Request,
    current_user: CurrentUser,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator),
    service: ConversationService = Depends(_get_conversation_service),
):
    """
    POST /api/chat/message
    """
    try:
        await enforce_chat_message_rate_limit(request, user_id=current_user.id)

        # 1. AgentContext oluştur (Güvenilir kaynak: current_user)
        context = AgentContext(
            user_id=current_user.id,
            role=current_user.role,
            customer_id=current_user.id,
            session_id=payload.session_id,
        )

        # 2. Conversation ensure
        conv = await service.ensure_conversation(
            session_id=payload.session_id,
            user_id=current_user.id,
            first_message=payload.content,
        )

        # Redis memory hydrate
        await service.hydrate_redis_memory(
            session_id=payload.session_id,
            user_id=current_user.id,
        )

        # 3. User mesajını kaydet
        await service.persist_message(
            conversation_id=conv.id,
            user_id=current_user.id,
            role="user",
            content=payload.content,
        )

        # 4. Agent'ı çalıştır (Context ile)
        response_key = "CHAT_MESSAGE_SENT"
        response_message = "Agent yanıtı alındı."
        extracted_metadata = None
        try:
            reply, extracted_metadata = await orchestrator.run(
                message=payload.content,
                context=context,
            )
        except ExternalServiceError as exc:
            logger.warning(
                "Agent harici servis hatası: %s",
                str(exc),
                extra={"user_id": current_user.id},
            )
            response_key = "CHAT_AGENT_UNAVAILABLE"
            response_message = "AI sağlayıcısı geçici olarak yanıt veremedi."
            reply = (
                "AI sağlayıcısına şu anda ulaşamıyorum. Mesajınız alındı; "
                "lütfen kısa süre sonra tekrar deneyin."
            )
        except AppException as exc:
            logger.warning(
                "Agent uygulama hatası: %s [%s]",
                exc.message,
                exc.key,
                extra={"user_id": current_user.id, "status_code": exc.status_code},
            )
            response_key = f"CHAT_AGENT_{exc.key}"
            response_message = "Agent isteği sınırlı yanıtla tamamlandı."
            reply = _app_exception_reply(exc)
        except Exception as exc:
            logger.error(
                "Agent çalıştırılırken beklenmeyen hata: %s",
                str(exc),
                extra={"user_id": current_user.id},
                exc_info=True,
            )
            response_key = "CHAT_AGENT_ERROR"
            response_message = "Agent yanıtı güvenli hata mesajıyla döndü."
            reply = (
                "Yanıt üretirken beklenmeyen bir teknik sorun yaşadım. "
                "Mesajınız kaydedildi; lütfen biraz sonra tekrar deneyin."
            )

        # 5. Assistant cevabını kaydet
        await service.persist_message(
            conversation_id=conv.id,
            user_id=current_user.id,
            role="assistant",
            content=reply,
            metadata_=extracted_metadata,
        )

        # 6. İlk mesajda başlık güncelle
        if conv.message_count == 0 or conv.title == "Yeni Sohbet":
            title = ConversationService._generate_title(payload.content)
            await service.update_conversation_title(conv.id, title)

        return _chat_reply_response(
            session_id=payload.session_id,
            reply=reply,
            metadata=extracted_metadata,
            message=response_message,
            key=response_key,
        )
    except RateLimitError as exc:
        logger.warning(
            "Chat rate limit aşıldı: %s",
            exc.message,
            extra={"user_id": current_user.id, "status_code": exc.status_code},
        )
        return _chat_reply_response(
            session_id=payload.session_id,
            reply=(
                f"{exc.message} Bu oturum açık kalacak; birkaç saniye sonra "
                "aynı sohbetten devam edebilirsiniz."
            ),
            message="Mesaj sınırı aşıldı.",
            key="CHAT_RATE_LIMITED",
        )
    except (ForbiddenError, NotFoundError) as exc:
        logger.warning(
            "Chat oturum erişim hatası: %s [%s]",
            exc.message,
            exc.key,
            extra={"user_id": current_user.id, "status_code": exc.status_code},
        )
        return _chat_reply_response(
            session_id=payload.session_id,
            reply=_app_exception_reply(exc),
            message="Sohbet oturumu kullanılamadı.",
            key=f"CHAT_{exc.key}",
        )
    except AppException as exc:
        logger.warning(
            "Chat uygulama hatası: %s [%s]",
            exc.message,
            exc.key,
            extra={"user_id": current_user.id, "status_code": exc.status_code},
        )
        return _chat_reply_response(
            session_id=payload.session_id,
            reply=_app_exception_reply(exc),
            message="Chat isteği sınırlı yanıtla tamamlandı.",
            key=f"CHAT_{exc.key}",
        )
    except SQLAlchemyError as exc:
        logger.error(
            "Chat veritabanı hatası: %s",
            str(exc),
            extra={"user_id": current_user.id},
            exc_info=True,
        )
        raise
    except Exception as exc:
        logger.error(
            "Chat endpoint beklenmeyen hata: %s",
            str(exc),
            extra={"user_id": current_user.id},
            exc_info=True,
        )
        return _chat_reply_response(
            session_id=payload.session_id,
            reply=(
                "Beklenmeyen bir teknik sorun oluştu. "
                "Oturumunuz korunuyor; lütfen biraz sonra tekrar deneyin."
            ),
            message="Chat isteği beklenmeyen hata ile tamamlandı.",
            key="CHAT_UNEXPECTED_ERROR",
        )


# ── Legacy History Endpointleri (backward compat) ────────


@router.get(
    "/history/{session_id}",
    response_model=None,
    summary="Konuşma geçmişini getir",
    description="Belirtilen oturum ID'sine ait konuşma geçmişini PostgreSQL'den getirir.",
    responses={
        200: {
            "description": "Konuşma geçmişi başarıyla getirildi.",
            "content": openapi_examples.example_content(
                data={
                    "session_id": "session-2026-001",
                    "messages": [
                        {"role": "user", "content": "Siparişim nerede?"},
                        {"role": "assistant", "content": "Siparişiniz dağıtıma çıkmış görünüyor."},
                    ],
                },
                message="Konuşma geçmişi başarıyla getirildi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def get_history(
    session_id: Annotated[str, Path(pattern=r"^[a-zA-Z0-9\-_]{1,100}$")],
    current_user: CurrentUser,
    service: Annotated[ConversationService, Depends(_get_conversation_service)],
):
    """
    GET /api/chat/history/{session_id}

    PostgreSQL'den kalıcı mesaj geçmişini getirir (user ownership kontrolü ile).
    """
    try:
        result = await service.get_conversation_with_messages(
            session_id=session_id, user_id=current_user.id
        )
        messages = [
            {"role": m.role, "content": m.content}
            for m in result["messages"]
        ]
    except Exception:
        # Conversation bulunamazsa boş liste dön (legacy compat)
        messages = []

    return success_response(
        data={"session_id": session_id, "messages": messages},
        message="Konuşma geçmişi başarıyla getirildi.",
    )


@router.delete(
    "/history/{session_id}",
    response_model=None,
    summary="Konuşma geçmişini temizle",
    description="Belirtilen oturum ID'sine ait konuşma geçmişini siler.",
    responses={
        200: {
            "description": "Konuşma geçmişi başarıyla temizlendi.",
            "content": openapi_examples.example_content(
                data={"session_id": "session-2026-001"},
                message="Konuşma geçmişi başarıyla temizlendi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def clear_history(
    session_id: Annotated[str, Path(pattern=r"^[a-zA-Z0-9\-_]{1,100}$")],
    current_user: CurrentUser,
    service: Annotated[ConversationService, Depends(_get_conversation_service)],
):
    """
    DELETE /api/chat/history/{session_id}

    Soft delete + Redis memory temizleme (user ownership kontrolü ile).
    """
    try:
        await service.delete_conversation(session_id=session_id, user_id=current_user.id)
    except Exception:
        pass  # Legacy compat — hata durumunda sessiz

    return success_response(
        data={"session_id": session_id},
        message="Konuşma geçmişi başarıyla temizlendi.",
    )
