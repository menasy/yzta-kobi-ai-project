from fastapi import APIRouter, Header
from app.services.chat_history_service import chat_history
from app.services.gemini_service import gemini_service # Gemini servisini ekledik
from app.core.responses import ApiResponse

router = APIRouter()

def success_response(data: any, message: str, status_code: int = 200):
    return ApiResponse(
        statusCode=status_code,
        key="SUCCESS",
        message=message,
        data=data
    )

@router.post("/message")
async def send_message(content: str, session_id: str = Header(default="default-session")):
    # 1. Önce Redis'ten geçmişi çek (Gemini kiminle konuştuğunu bilsin)
    full_history = await chat_history.get_history(session_id)
    
    # 2. GEMINI'ye sor (Mesajı ve geçmişi paketleyip gönderiyoruz)
    # Not: gemini_service.py dosyasını oluşturduysan bu çalışacaktır.
    ai_reply = await gemini_service.get_response(content, history=full_history)
    
    # 3. Hafızayı Güncelle: Kullanıcının yeni mesajını kaydet
    await chat_history.add_message(session_id, "user", content)
    
    # 4. Hafızayı Güncelle: AI'ın verdiği gerçek cevabı kaydet
    await chat_history.add_message(session_id, "assistant", ai_reply)
    
    return success_response(
        data={"reply": ai_reply, "session_id": session_id}, 
        message="AI cevap üretti."
    )

@router.get("/history")
async def get_history(session_id: str = Header(default="default-session")):
    history = await chat_history.get_history(session_id)
    
    return success_response(
        data=history, 
        message="Geçmiş başarıyla getirildi."
    )