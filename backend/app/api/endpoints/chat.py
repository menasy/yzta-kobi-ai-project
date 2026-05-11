# api/endpoints/chat.py
# AI Agent chat endpointleri.
# Business logic içermez; orchestrator ve memory dependency'leri üzerinden çalışır.

from fastapi import APIRouter, Depends, Request

from app.agent.memory import ConversationMemory
from app.agent.orchestrator import AgentOrchestrator
from app.core import openapi_examples
from app.core.dependencies import CurrentUser, get_agent_orchestrator
from app.core.rate_limit import enforce_chat_message_rate_limit
from app.core.response_builder import success_response
from app.schemas.chat import ChatMessageRequest, ChatResponse

router = APIRouter()


def _get_memory() -> ConversationMemory:
    """ConversationMemory dependency."""
    return ConversationMemory()


@router.post(
    "/message",
    response_model=None,
    summary="Agent'a mesaj gönder",
    description="Kullanıcı mesajını AI agent'a iletir ve yanıt alır.",
    responses={
        200: {
            "description": "Agent yanıtı başarıyla oluşturuldu.",
            "content": openapi_examples.example_content(
                data=openapi_examples.CHAT_RESPONSE_EXAMPLE,
                message="Agent yanıtı alındı.",
            ),
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        429: {
            "description": "Rate limit aşıldı.",
            "content": {"application/json": {"example": openapi_examples.RATE_LIMIT_RESPONSE}},
        },
        422: {
            "description": "Validasyon hatası.",
            "content": {"application/json": {"example": openapi_examples.VALIDATION_ERROR_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def send_message(
    payload: ChatMessageRequest,
    request: Request,
    current_user: CurrentUser,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator),
):
    """
    POST /api/chat/message

    Kullanıcı mesajını orchestrator'a iletir.
    Orchestrator ReAct döngüsüyle tool'ları çağırır ve final yanıt üretir.
    """
    await enforce_chat_message_rate_limit(request, user_id=current_user.id)

    reply = await orchestrator.run(
        message=payload.content,
        session_id=payload.session_id,
    )

    return success_response(
        data=ChatResponse(reply=reply, session_id=payload.session_id).model_dump(),
        message="Agent yanıtı alındı.",
    )


@router.get(
    "/history/{session_id}",
    response_model=None,
    summary="Konuşma geçmişini getir",
    description="Belirtilen oturum ID'sine ait konuşma geçmişini Redis'ten getirir.",
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
        401: {
            "description": "Yetkisiz erişim.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def get_history(
    session_id: str,
    current_user: CurrentUser,
    memory: ConversationMemory = Depends(_get_memory),
):
    """
    GET /api/chat/history/{session_id}

    Redis memory'den konuşma geçmişini getirir.
    """
    history = await memory.get_history(session_id)

    return success_response(
        data={"session_id": session_id, "messages": history},
        message="Konuşma geçmişi başarıyla getirildi.",
    )


@router.delete(
    "/history/{session_id}",
    response_model=None,
    summary="Konuşma geçmişini temizle",
    description="Belirtilen oturum ID'sine ait konuşma geçmişini Redis'ten siler.",
    responses={
        200: {
            "description": "Konuşma geçmişi başarıyla temizlendi.",
            "content": openapi_examples.example_content(
                data={"session_id": "session-2026-001"},
                message="Konuşma geçmişi başarıyla temizlendi.",
            ),
        },
        401: {
            "description": "Yetkisiz erişim.",
            "content": {"application/json": {"example": openapi_examples.UNAUTHORIZED_RESPONSE}},
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {"application/json": {"example": openapi_examples.INTERNAL_ERROR_RESPONSE}},
        },
    },
)
async def clear_history(
    session_id: str,
    current_user: CurrentUser,
    memory: ConversationMemory = Depends(_get_memory),
):
    """
    DELETE /api/chat/history/{session_id}

    Redis memory'den konuşma geçmişini siler.
    """
    await memory.clear(session_id)

    return success_response(
        data={"session_id": session_id},
        message="Konuşma geçmişi başarıyla temizlendi.",
    )
