# core/openapi_examples.py
# OpenAPI/Swagger dokümantasyonu için merkezi gerçekçi örnek veri havuzu.
# Pydantic modellerinde json_schema_extra içinde kullanılır.

from typing import Any

# ── Standart Hata Örnekleri ─────────────────────────────

UNAUTHORIZED_RESPONSE = {
    "statusCode": 401,
    "key": "UNAUTHORIZED",
    "message": "Kimlik doğrulama başarısız veya token geçersiz.",
    "data": None,
    "errors": None
}

FORBIDDEN_RESPONSE = {
    "statusCode": 403,
    "key": "FORBIDDEN",
    "message": "Bu işlem için yetkiniz bulunmamaktadır.",
    "data": None,
    "errors": None
}

NOT_FOUND_RESPONSE = {
    "statusCode": 404,
    "key": "NOT_FOUND",
    "message": "Aranan kayıt bulunamadı.",
    "data": None,
    "errors": None
}

VALIDATION_ERROR_RESPONSE = {
    "statusCode": 422,
    "key": "VALIDATION_ERROR",
    "message": "İstek verisi geçersiz. Lütfen alanları kontrol edin.",
    "data": None,
    "errors": [
        {"field": "email", "message": "Geçersiz e-posta formatı."},
        {"field": "password", "message": "Şifre en az 8 karakter olmalıdır."}
    ]
}

# ── Auth Örnekleri ─────────────────────────────────────

USER_EXAMPLE = {
    "id": 1,
    "email": "admin@kobi.ai",
    "full_name": "Mehmet Yılmaz",
    "role": "admin",
    "is_active": True,
    "last_login_at": "2024-05-10T10:00:00Z",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-05-10T10:00:00Z"
}

LOGIN_REQUEST_EXAMPLE = {
    "email": "admin@kobi.ai",
    "password": "StrongPass123!"
}

REGISTER_REQUEST_EXAMPLE = {
    "email": "user@kobi.ai",
    "password": "StrongPass123!",
    "full_name": "Ahmet Demir",
    "role": "admin"
}

# ── Ürün Örnekleri ─────────────────────────────────────

PRODUCT_EXAMPLE = {
    "id": 101,
    "name": "Kablosuz Mouse",
    "sku": "MS-001",
    "price": 250.00,
    "stock_quantity": 45,
    "category": "Elektronik",
    "is_active": True,
    "created_at": "2024-02-15T09:30:00Z",
    "updated_at": "2024-05-09T16:45:00Z"
}

PRODUCT_CREATE_EXAMPLE = {
    "name": "Kablosuz Mouse",
    "sku": "MS-001",
    "price": 250.00,
    "stock_quantity": 50,
    "category": "Elektronik"
}

# ── Helper Fonksiyonlar ───────────────────────────────

def get_api_response_example(
    data: Any = None, 
    message: str = "İşlem başarıyla tamamlandı.", 
    key: str = "SUCCESS", 
    status_code: int = 200
) -> dict[str, Any]:
    """Standart ApiResponse zarfı içinde örnek veri oluşturur."""
    return {
        "statusCode": status_code,
        "key": key,
        "message": message,
        "data": data,
        "errors": None
    }
