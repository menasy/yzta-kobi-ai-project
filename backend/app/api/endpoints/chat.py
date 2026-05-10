# api/endpoints/chat.py
# AI Agent chat endpointleri.
# Orchestrator üzerinden agent'a mesaj gönderir.
# ConversationMemory üzerinden geçmiş yönetir.
# Business logic içermez — sadece request alır, dependency ile servis alır, response döner.

from fastapi import APIRouter, Depends

from app.agent.memory import ConversationMemory
from app.agent.orchestrator import AgentOrchestrator
from app.core.dependencies import CurrentUser, get_agent_orchestrator
from app.core.response_builder import success_response
from app.schemas.chat import ChatMessageRequest, ChatResponse

router = APIRouter()


# ── Dependency Factories ─────────────────────────────────


def _get_memory() -> ConversationMemory:
    """ConversationMemory dependency."""
    return ConversationMemory()


# ── Endpoints ────────────────────────────────────────────


@router.post(
    "/message",
    summary="Agent'a mesaj gönder",
    description="Kullanıcı mesajını AI agent'a iletir ve yanıt alır.",
    responses={
        200: {
            "description": "Agent yanıtı başarıyla oluşturuldu.",
            "content": {
                "application/json": {
                    "example": {
                        "statusCode": 200,
                        "key": "SUCCESS",
                        "message": "Agent yanıtı alındı.",
                        "data": {
                            "reply": "Siparişiniz kargoda, şu an Ankara'da.",
                            "session_id": "abc123",
                        },
                        "errors": None,
                    }
                }
            },
        },
    },
)
async def send_message(
    payload: ChatMessageRequest,
    current_user: CurrentUser,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator),
):
    """
    POST /api/chat/message

    Kullanıcı mesajını orchestrator'a iletir.
    Orchestrator ReAct döngüsüyle tool'ları çağırır ve final yanıt üretir.
    """
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
    summary="Konuşma geçmişini getir",
    description="Belirtilen oturum ID'sine ait konuşma geçmişini Redis'ten getirir.",
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
    summary="Konuşma geçmişini temizle",
    description="Belirtilen oturum ID'sine ait konuşma geçmişini Redis'ten siler.",
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