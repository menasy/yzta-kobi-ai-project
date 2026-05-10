from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session as get_db
from app.services.ai_service import AIService
from app.core.response_builder import success_response
from app.core import openapi_examples
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

    model_config = {
        "json_schema_extra": {
            "example": openapi_examples.AI_CHAT_REQUEST_EXAMPLE
        }
    }

@router.post(
    "/chat",
    responses={
        200: {
            "description": "AI yanıtı başarıyla oluşturuldu.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data=openapi_examples.AI_CHAT_RESPONSE_DATA_EXAMPLE,
                        message="AI yanıtı başarıyla oluşturuldu.",
                        key="AI_CHAT_SUCCESS"
                    )
                }
            }
        },
        502: {
            "description": "AI sağlayıcısı yanıt veremedi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        status_code=502,
                        key="AI_PROVIDER_ERROR",
                        message="AI sağlayıcısı yanıt veremedi."
                    )
                }
            }
        }
    }
)
async def chat_with_ai(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    ai_service = AIService(db)
    response = await ai_service.ask_ai(request.message)
    return success_response(
        data={"response": response},
        message="AI yanıtı başarıyla oluşturuldu.",
        key="AI_CHAT_SUCCESS",
    )