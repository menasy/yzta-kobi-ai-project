# core/response_builder.py
# Endpoint'ler doğrudan JSONResponse oluşturmak yerine bu fonksiyonları kullanır.
# Her endpoint success_response() veya error_response() üzerinden dönmelidir.
# Ham dict veya JSONResponse({...}) döndürmek yasaktır.

import math
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .responses import ApiResponse, PaginatedData


def _serialize(obj: Any) -> Any:
    """Pydantic model, datetime, Decimal gibi tipleri JSON-safe hale getirir."""
    if isinstance(obj, BaseModel):
        return obj.model_dump(mode="json")
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_serialize(item) for item in obj]
    return obj


def success_response(
    data: Any = None,
    message: str = "İşlem başarıyla tamamlandı.",
    key: str = "SUCCESS",
    status_code: int = 200,
) -> JSONResponse:
    """
    Başarılı yanıt döndürür.

    Kullanım:
        return success_response(data=product, message="Ürün oluşturuldu.", status_code=201)
    """
    body = ApiResponse(
        statusCode=status_code,
        key=key,
        message=message,
        data=_serialize(data),
        errors=None,
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())


def error_response(
    message: str,
    key: str = "ERROR",
    status_code: int = 400,
    errors: list[Any] | None = None,
) -> JSONResponse:
    """
    Hata yanıtı döndürür.

    Kullanım:
        return error_response(message="Ürün bulunamadı.", key="NOT_FOUND", status_code=404)
    """
    body = ApiResponse(
        statusCode=status_code,
        key=key,
        message=message,
        data=None,
        errors=_serialize(errors),
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())


def paginated_response(
    items: list[Any],
    total: int,
    page: int,
    size: int,
    message: str = "Liste başarıyla getirildi.",
) -> JSONResponse:
    """
    Sayfalı liste yanıtı döndürür.

    Kullanım:
        return paginated_response(items=products, total=100, page=1, size=20)
    """
    pages = math.ceil(total / size) if size > 0 else 0
    paginated = PaginatedData(
        items=_serialize(items),
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
    body = ApiResponse(
        statusCode=200,
        key="SUCCESS",
        message=message,
        data=paginated.model_dump(),
        errors=None,
    )
    return JSONResponse(status_code=200, content=body.model_dump())


def validation_error_response(
    errors: list[dict[str, str]],
    message: str = "İstek verisi geçersiz. Lütfen alanları kontrol edin.",
) -> JSONResponse:
    """
    Pydantic validation hatalarını standart response formatında döndürür.

    Kullanım:
        return validation_error_response(errors=[{"field": "email", "message": "Geçersiz format."}])
    """
    body = ApiResponse(
        statusCode=422,
        key="VALIDATION_ERROR",
        message=message,
        data=None,
        errors=errors,
    )
    return JSONResponse(status_code=422, content=body.model_dump())
