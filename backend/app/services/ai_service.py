import os
import httpx  
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self, db_session):
        self.db = db_session
        self.api_key = os.getenv("GOOGLE_API_KEY")
        # Google'ın ana v1 API adresi
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.api_key}"

    async def ask_ai(self, user_message: str):
        payload = {
            "contents": [{
                "parts": [{"text": user_message}]
            }]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.url, json=payload, timeout=30.0)
            
            if response.status_code != 200:
                return f"Hata Oluştu: {response.text}"
            
            data = response.json()
            # Google'dan gelen cevabı ayıkla
            return data['candidates'][0]['content']['parts'][0]['text']