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
    "errors": None,
}

FORBIDDEN_RESPONSE = {
    "statusCode": 403,
    "key": "FORBIDDEN",
    "message": "Bu işlem için yetkiniz bulunmamaktadır.",
    "data": None,
    "errors": None,
}

NOT_FOUND_RESPONSE = {
    "statusCode": 404,
    "key": "NOT_FOUND",
    "message": "Aranan kayıt bulunamadı.",
    "data": None,
    "errors": None,
}

INTERNAL_ERROR_RESPONSE = {
    "statusCode": 500,
    "key": "INTERNAL_ERROR",
    "message": "Beklenmeyen bir hata oluştu.",
    "data": None,
    "errors": None,
}

RATE_LIMIT_RESPONSE = {
    "statusCode": 429,
    "key": "RATE_LIMIT_EXCEEDED",
    "message": "İstek sınırı aşıldı. Lütfen biraz bekleyip tekrar deneyin.",
    "data": None,
    "errors": None,
}

VALIDATION_ERROR_RESPONSE = {
    "statusCode": 422,
    "key": "VALIDATION_ERROR",
    "message": "İstek verisi geçersiz. Lütfen alanları kontrol edin.",
    "data": None,
    "errors": [
        {"field": "email", "message": "Geçersiz e-posta formatı."},
        {"field": "password", "message": "Şifre en az 8 karakter olmalıdır."},
    ],
}

INSUFFICIENT_STOCK_RESPONSE = {
    "statusCode": 409,
    "key": "INSUFFICIENT_STOCK",
    "message": "Kablosuz Mouse için yeterli stok yok. Talep: 3, mevcut: 1.",
    "data": None,
    "errors": None,
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
    "updated_at": "2024-05-10T10:00:00Z",
}

LOGIN_REQUEST_EXAMPLE = {"email": "admin@kobi.ai", "password": "StrongPass123!"}

REGISTER_REQUEST_EXAMPLE = {"email": "user@kobi.ai", "password": "StrongPass123!", "full_name": "Ahmet Demir"}

COOKIE_AUTH_DESCRIPTION = (
    "Kimlik doğrulama HttpOnly cookie tabanlıdır. "
    "Token değerleri response body içinde dönmez. "
    "Login/refresh sonrası access_token ve refresh_token cookie olarak set edilir. "
    "Frontend isteklerinde credentials/include veya withCredentials=true kullanılmalıdır."
)

# ── Kullanıcı Ayarları Örnekleri ────────────────────────

USER_PROFILE_EXAMPLE = {
    "id": 42,
    "email": "ahmet.demir@example.com",
    "full_name": "Ahmet Demir",
    "role": "customer",
    "is_active": True,
    "last_login_at": "2026-05-12T09:15:00Z",
    "created_at": "2026-05-01T10:00:00Z",
    "updated_at": "2026-05-12T09:15:00Z",
}

USER_PROFILE_UPDATE_EXAMPLE = {
    "full_name": "Ahmet Demir",
}

USER_ADDRESS_UPSERT_EXAMPLE = {
    "full_name": "Ahmet Demir",
    "phone": "05321234567",
    "address": "Atatürk Mah. Cumhuriyet Cad. No: 12 D: 4",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postal_code": "34710",
    "country": "Türkiye",
    "note": "Mesai saatlerinde teslim edilebilir.",
}

USER_ADDRESS_EXAMPLE = {
    "id": 12,
    **USER_ADDRESS_UPSERT_EXAMPLE,
    "created_at": "2026-05-12T09:20:00Z",
    "updated_at": "2026-05-12T09:20:00Z",
}

# ── Ürün Örnekleri ─────────────────────────────────────

PRODUCT_EXAMPLE = {
    "id": 101,
    "name": "Kablosuz Mouse",
    "sku": "MS-001",
    "description": "Ergonomik tasarıma sahip, 2.4 GHz bağlantılı kablosuz mouse.",
    "price": "250.00",
    "category": "Elektronik",
    "image_url": "https://cdn.kobi.local/products/ms-001.png",
    "is_active": True,
    "created_at": "2024-02-15T09:30:00Z",
    "updated_at": "2024-05-09T16:45:00Z",
}

PRODUCT_CREATE_EXAMPLE = {
    "name": "Kablosuz Mouse",
    "sku": "MS-001",
    "description": "Ergonomik tasarıma sahip, 2.4 GHz bağlantılı kablosuz mouse.",
    "price": 250.00,
    "category": "Elektronik",
    "image_url": "https://cdn.kobi.local/products/ms-001.png",
}

# ── Chat Örnekleri ─────────────────────────────────────

CHAT_MESSAGE_REQUEST_EXAMPLE = {
    "session_id": "session-2026-001",
    "content": "128 numaralı siparişimin kargo durumunu kontrol eder misin?",
}

CHAT_RESPONSE_EXAMPLE = {
    "reply": "Siparişiniz kargoya verilmiş görünüyor, son durum: Ankara transfer merkezinde.",
    "session_id": "session-2026-001",
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

# ── Sipariş/Kargo Örnekleri ────────────────────────────

CUSTOMER_ORDER_CREATE_EXAMPLE = {
    "items": [
        {"product_id": 101, "quantity": 2},
        {"product_id": 102, "quantity": 1},
    ],
    "shipping": {
        "full_name": "Ahmet Demir",
        "phone": "05321234567",
        "address": "Atatürk Mah. Cumhuriyet Cad. No: 12 D: 4",
        "city": "İstanbul",
        "district": "Kadıköy",
        "postal_code": "34710",
        "country": "Türkiye",
        "note": "Mesai saatlerinde teslim edilebilir.",
    },
    "notes": "Fatura bilgileri teslimat adresiyle aynı.",
}

ORDER_ITEM_RESPONSE_EXAMPLE = {
    "id": 5001,
    "order_id": 128,
    "product_id": 101,
    "quantity": 2,
    "unit_price": 250.00,
    "total_price": 500.00,
    "created_at": "2026-05-11T12:00:00Z",
}

CUSTOMER_ORDER_RESPONSE_EXAMPLE = {
    "id": 128,
    "order_number": "ORD-20260511-A1B2C3D4",
    "customer_id": 42,
    "status": "pending",
    "total_amount": 750.00,
    "notes": "Fatura bilgileri teslimat adresiyle aynı.",
    "shipping_full_name": "Ahmet Demir",
    "shipping_phone": "05321234567",
    "shipping_address": "Atatürk Mah. Cumhuriyet Cad. No: 12 D: 4",
    "shipping_city": "İstanbul",
    "shipping_district": "Kadıköy",
    "shipping_postal_code": "34710",
    "shipping_country": "Türkiye",
    "shipping_note": "Mesai saatlerinde teslim edilebilir.",
    "placed_at": "2026-05-11T12:00:00Z",
    "cancelled_at": None,
    "created_at": "2026-05-11T12:00:00Z",
    "updated_at": "2026-05-11T12:00:00Z",
    "order_items": [ORDER_ITEM_RESPONSE_EXAMPLE],
}

ADMIN_ORDER_RESPONSE_EXAMPLE = {
    **CUSTOMER_ORDER_RESPONSE_EXAMPLE,
    "customer": {
        "id": 42,
        "full_name": "Ahmet Demir",
        "phone": None,
        "email": "ahmet.demir@example.com",
    },
}

ORDER_SUMMARY_EXAMPLE = {
    "date": "2026-05-11",
    "total_orders": 42,
    "pending": 10,
    "processing": 12,
    "shipped": 9,
    "delivered": 10,
    "cancelled": 1,
    "total_revenue": 18750.40,
}

ORDER_DETAIL_EXAMPLE = {
    **ADMIN_ORDER_RESPONSE_EXAMPLE,
}

SHIPMENT_TRACK_EXAMPLE = {
    "tracking_number": "TRK-2026-9812",
    "location": "Dağıtım Merkezinde",
}

# ── Helper Fonksiyonlar ───────────────────────────────


def get_api_response_example(
    data: Any = None, message: str = "İşlem başarıyla tamamlandı.", key: str = "SUCCESS", status_code: int = 200
) -> dict[str, Any]:
    """Standart ApiResponse zarfı içinde örnek veri oluşturur."""
    return {"statusCode": status_code, "key": key, "message": message, "data": data, "errors": None}


def example_content(
    data: Any = None, *, message: str = "İşlem başarıyla tamamlandı.", key: str = "SUCCESS", status_code: int = 200
) -> dict[str, Any]:
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
