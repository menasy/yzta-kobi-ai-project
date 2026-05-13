import json
from app.services.redis_service import redis_service
from app.core.config import get_settings

settings = get_settings()

class ChatHistoryService:
    def __init__(self):
        self.ttl = settings.REDIS_CONVERSATION_TTL

    async def add_message(self, session_id: str, role: str, content: str):
        """Mesajı Redis'teki listeye ekler (JSON olarak)"""
        key = f"chat:{session_id}"
        message = {"role": role, "content": content}
        
        # Mevcut geçmişi al
        history_raw = await redis_service.get_value(key)
        history = json.loads(history_raw) if history_raw else []
        
        # Yeni mesajı ekle ve kaydet
        history.append(message)
        await redis_service.set_value(key, json.dumps(history), expire=self.ttl)

    async def get_history(self, session_id: str):
        """Konuşma geçmişini liste olarak döner"""
        key = f"chat:{session_id}"
        history_raw = await redis_service.get_value(key)
        return json.loads(history_raw) if history_raw else []

    async def clear_history(self, session_id: str):
        """Hafızayı siler (Yeni sohbet başlatmak için)"""
        await redis_service.delete_value(f"chat:{session_id}")

chat_history = ChatHistoryService()