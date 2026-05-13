# api/endpoints/chat.py
# AI Agent chat endpointleri.
# Kalıcı sohbet geçmişi: PostgreSQL + Redis uyumlu.
# Tüm endpoint'lerde user ownership kontrolü zorunlu.

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Request

from app.agent.orchestrator import AgentOrchestrator
from app.core import openapi_examples, openapi_responses
from app.core.dependencies import CurrentUser, DBSession, get_agent_orchestrator
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


from app.agent.context import AgentContext
from app.core.exceptions import AppException, ExternalServiceError

# ... (rest of imports)

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
            customer_id=current_user.id, # Customer id = User id varsayımı
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
        is_success = True
        try:
            reply = await orchestrator.run(
                message=payload.content,
                context=context,
            )
        except (AppException, ExternalServiceError) as exc:
            is_success = False
            logger.warning("Agent servis/iş mantığı hatası: %s", str(exc))
            reply = exc.message or "Şu anda bu bilgiyi kontrol edemiyorum. Lütfen biraz sonra tekrar deneyin."
        except Exception as exc:
            is_success = False
            logger.error("Agent çalıştırılırken hata: %s", str(exc), exc_info=True)
            reply = "Üzgünüm, işleminizi şu anda gerçekleştiremiyorum. Lütfen kısa süre sonra tekrar deneyin."

        # 5. Assistant cevabını kaydet (Sadece başarı durumunda)
        if is_success:
            await service.persist_message(
                conversation_id=conv.id,
                user_id=current_user.id,
                role="assistant",
                content=reply,
            )

        # 6. İlk mesajda başlık güncelle
        if conv.message_count == 0 or conv.title == "Yeni Sohbet":
            title = ConversationService._generate_title(payload.content)
            await service.update_conversation_title(conv.id, title)

        return success_response(
            data=ChatResponse(reply=reply, session_id=payload.session_id).model_dump(),
            message="Agent yanıtı alındı.",
            key="CHAT_MESSAGE_SENT",
        )
        
    except Exception as e:
        # Rate limit veya en temel hatalar için
        logger.error("Chat endpoint kritik hata: %s", str(e), exc_info=True)
        return success_response(
            data=ChatResponse(
                reply="Bir sorun oluştu. Lütfen tekrar deneyin.", 
                session_id=payload.session_id
            ).model_dump(),
            message="Hata oluştu.",
            key="CHAT_ERROR"
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
