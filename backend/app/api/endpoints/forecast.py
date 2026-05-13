from fastapi import APIRouter, Depends

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import AdminUser, get_forecast_engine
from app.core.response_builder import success_response
from app.schemas.forecast import ProductForecastResponse
from app.services.forecasting_service import ForecastEngine

router = APIRouter()


@router.get(
    "/{product_id}",
    response_model=None,
    summary="Ürün haftalık satış tahmini",
    responses={
        200: {
            "description": "Tahmin başarıyla üretildi.",
            "content": openapi_examples.example_content(
                data={
                    "product_id": 101,
                    "forecast": [
                        {"date": "2026-05-14", "estimated_sales": 4.2},
                        {"date": "2026-05-15", "estimated_sales": 3.8},
                    ],
                },
                message="Satış tahmini üretildi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(description="Admin yetkisi gerekli."),
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.bad_request_response(description="Tahmin için yeterli satış geçmişi yok."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_product_forecast(
    product_id: int,
    admin: AdminUser,
    engine: ForecastEngine = Depends(get_forecast_engine),
):
    """Belirli bir ürün için gelecek 7 günlük satış tahminini döndürür."""
    predictions = await engine.predict_next_week(product_id)
    return success_response(
        data=ProductForecastResponse(product_id=product_id, forecast=predictions),
        message="Satış tahmini üretildi.",
    )
