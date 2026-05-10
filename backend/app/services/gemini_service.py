import google.generativeai as genai
from app.core.config import get_settings

import os
os.environ["GOOGLE_API_USE_MTLS_ENDPOINT"] = "never" # Bazı bağlantı hatalarını çözer

settings = get_settings()


# backend/app/services/gemini_service.py

class GeminiService:
    def __init__(self):
        # ... diğer kodlar
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # BURAYI GÜNCELLE: Terminalde 'gemini-2.5-flash' başarılı olmuştu.
        #self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')



    async def get_response(self, prompt: str, history: list = None):
        try:
            gemini_history = []
            if history:
                # History'yi daha sade bir şekilde dönüştürelim
                for msg in history:
                    role = "user" if msg["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [msg["content"]]})
            
            # Start chat senkron çalışır, await eklemeye gerek yok
            chat = self.model.start_chat(history=gemini_history)
            
            # send_message'ı bir thread içinde veya doğrudan çağıralım
            # (Bazı sürümlerde async desteği farklılık gösterebilir)
            response = chat.send_message(prompt)
            return response.text
        except Exception as e:
            return f"AI Hatası Oluştu: {str(e)}"

gemini_service = GeminiService()