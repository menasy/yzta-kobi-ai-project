from google import genai
from google.genai import errors as genai_errors
from app.core.config import get_settings
from app.core.exceptions import ExternalServiceError
from app.core.logger import get_logger

logger = get_logger(__name__)

class AIService:
    def __init__(self, db_session):
        self.db = db_session
        self.settings = get_settings()

    async def ask_ai(self, user_message: str) -> str:
        """
        Kullanıcı mesajını Gemini AI modeline gönderir ve cevabı döner.
        google-genai SDK kullanır.
        """
        try:
            client = genai.Client(api_key=self.settings.GEMINI_API_KEY)
            # generate_content senkron çağrı yapabilir veya async için aio da kullanılabilir. 
            # Şu anlık standart usage'ı kullanıyoruz. İleride async methodu varsa (client.aio.models...)
            # eklenebilir, fakat prompt'taki örneğe sadık kalıyoruz.
            response = client.models.generate_content(
                model=self.settings.LLM_MODEL,
                contents=user_message,
            )
            return response.text
        except genai_errors.APIError as e:
            logger.error(f"Gemini API Error: {e}")
            raise ExternalServiceError(
                message="AI sağlayıcısı yanıt veremedi.",
            )
        except Exception as e:
            logger.error(f"Unexpected AI Error: {e}")
            raise ExternalServiceError(
                message="AI sağlayıcısı yanıt veremedi.",
            )