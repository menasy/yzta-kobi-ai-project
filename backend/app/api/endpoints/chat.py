# senaryo1: LLM ile entegrasyon yapılacak, mesaj gönderildiğinde LLM'den cevap alınacak

from fastapi import APIRouter
from app.core.responses import success_response

router = APIRouter()

@router.post("/message")
async def send_message(content: str):
    # Senaryo 1: LLM buraya bağlanacak
    return success_response(
        data={"reply": "Mesajınız alındı, işleniyor..."}, 
        message="Mesaj iletildi."
    )

@router.get("/history")
async def get_history():
    return success_response(data=[], message="Mesaj geçmişi boş.")