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

INTERNAL_ERROR_RESPONSE = {
    "statusCode": 500,
    "key": "INTERNAL_ERROR",
    "message": "Beklenmeyen bir hata oluştu.",
    "data": None,
    "errors": None
}

RATE_LIMIT_RESPONSE = {
    "statusCode": 429,
    "key": "RATE_LIMIT_EXCEEDED",
    "message": "İstek sınırı aşıldı. Lütfen biraz bekleyip tekrar deneyin.",
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

COOKIE_AUTH_DESCRIPTION = (
    "Kimlik doğrulama HttpOnly cookie tabanlıdır. "
    "Token değerleri response body içinde dönmez. "
    "Login/refresh sonrası access_token ve refresh_token cookie olarak set edilir."
)

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

# ── Chat Örnekleri ─────────────────────────────────────

CHAT_MESSAGE_REQUEST_EXAMPLE = {
    "session_id": "session-2026-001",
    "content": "128 numaralı siparişimin kargo durumunu kontrol eder misin?"
}

CHAT_RESPONSE_EXAMPLE = {
    "reply": "Siparişiniz kargoya verilmiş görünüyor, son durum: Ankara transfer merkezinde.",
    "session_id": "session-2026-001"
}

# ── Notification Örnekleri ────────────────────────────

NOTIFICATION_EXAMPLE = {
    "id": 1204,
    "type": "LOW_STOCK_ALERT",
    "title": "Kritik stok uyarısı: Kablosuz Mouse",
    "message": "MS-001 kodlu ürün için stok 3 adede düştü. Eşik değeri: 10.",
    "severity": "warning",
    "payload": {
        "product_id": 101,
        "product_name": "Kablosuz Mouse",
        "sku": "MS-001",
        "current_quantity": 3,
        "threshold": 10,
    },
    "is_read": False,
    "read_at": None,
    "created_at": "2026-05-10T22:00:00Z",
    "updated_at": "2026-05-10T22:00:00Z",
}

NOTIFICATION_LIST_ITEM_EXAMPLE = {
    "id": 1204,
    "type": "LOW_STOCK_ALERT",
    "title": "Kritik stok uyarısı: Kablosuz Mouse",
    "severity": "warning",
    "is_read": False,
    "read_at": None,
    "created_at": "2026-05-10T22:00:00Z",
}

NOTIFICATION_MARK_READ_EXAMPLE = {
    "id": 1204,
    "is_read": True,
    "read_at": "2026-05-10T22:15:00Z",
    "updated_at": "2026-05-10T22:15:00Z",
}

# ── Envanter Örnekleri ────────────────────────────────

INVENTORY_EXAMPLE = {
    "id": 1,
    "product_id": 101,
    "quantity": 45,
    "reserved_quantity": 5,
    "available_quantity": 40,
    "low_stock_threshold": 10,
    "last_updated_at": "2026-05-09T16:45:00Z",
    "updated_at": "2026-05-09T16:45:00Z",
}

INVENTORY_UPDATE_EXAMPLE = {
    "quantity": 5,
    "low_stock_threshold": 10,
}

# ── Sipariş/Kargo Örnekleri (stub endpoint docs için) ──

ORDER_SUMMARY_EXAMPLE = {
    "total_orders": 42,
    "revenue": 18750.40,
}

ORDER_DETAIL_EXAMPLE = {
    "order_id": 128,
    "status": "hazırlanıyor",
}

SHIPMENT_TRACK_EXAMPLE = {
    "tracking_number": "TRK-2026-9812",
    "location": "Dağıtım Merkezinde",
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


def example_content(data: Any = None, *, message: str = "İşlem başarıyla tamamlandı.", key: str = "SUCCESS", status_code: int = 200) -> dict[str, Any]:
    """OpenAPI responses.content için kısa helper."""
    return {
        "application/json": {
            "example": get_api_response_example(
                data=data,
                message=message,
                key=key,
                status_code=status_code,
            )
        }
    }
