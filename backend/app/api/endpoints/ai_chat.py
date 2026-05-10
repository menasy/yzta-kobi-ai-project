from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session as get_db
from app.services.ai_service import AIService
from app.core.response_builder import success_response
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_ai(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    ai_service = AIService(db)
    response = await ai_service.ask_ai(request.message)
    return success_response(
        data={"response": response},
        message="AI yanıtı başarıyla oluşturuldu.",
        key="AI_CHAT_SUCCESS",
    )