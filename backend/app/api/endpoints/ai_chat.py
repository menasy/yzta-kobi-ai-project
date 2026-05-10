from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session as get_db
from app.services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_ai(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    ai_service = AIService(db)
    response = await ai_service.ask_ai(request.message)
    return {"response": response}