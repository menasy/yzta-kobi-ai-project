# core/exceptions.py
# Tüm uygulama exception'ları buradan türetilir.
# Service katmanı HTTPException fırlatmaz; bu sınıfları kullanır.
# Global exception handler bu exception'ları yakalayarak standart response formatına dönüştürür.

from typing import Any


class AppException(Exception):
    """Tüm uygulama exception'larının base class'ı."""

    status_code: int = 500
    key: str = "INTERNAL_ERROR"
    message: str = "Beklenmeyen bir hata oluştu."

    def __init__(
        self,
        message: str | None = None,
        errors: list[Any] | None = None,
    ) -> None:
        self.message = message or self.__class__.message
        self.errors = errors
        super().__init__(self.message)

    def to_dict(self) -> dict[str, Any]:
        """Global response sistemine aktarılabilecek dict formatı."""
        return {
            "statusCode": self.status_code,
            "key": self.key,
            "message": self.message,
            "data": None,
            "errors": self.errors,
        }


class BadRequestError(AppException):
    """Geçersiz istek — 400."""

    status_code = 400
    key = "BAD_REQUEST"
    message = "İstek geçersiz."


class NotFoundError(AppException):
    """Kayıt bulunamadı — 404."""

    status_code = 404
    key = "NOT_FOUND"
    message = "Kayıt bulunamadı."


class ValidationError(AppException):
    """İstek verisi geçersiz — 422."""

    status_code = 422
    key = "VALIDATION_ERROR"
    message = "İstek verisi geçersiz."


class UnauthorizedError(AppException):
    """Kimlik doğrulama başarısız — 401."""

    status_code = 401
    key = "UNAUTHORIZED"
    message = "Kimlik doğrulama başarısız."


class ForbiddenError(AppException):
    """Yetki yok — 403."""

    status_code = 403
    key = "FORBIDDEN"
    message = "Bu işlem için yetkiniz yok."


class ConflictError(AppException):
    """Kayıt zaten mevcut — 409."""

    status_code = 409
    key = "CONFLICT"
    message = "Kayıt zaten mevcut."


class InsufficientStockError(AppException):
    """Yetersiz stok — 409."""

    status_code = 409
    key = "INSUFFICIENT_STOCK"
    message = "Yeterli stok bulunmamaktadır."


class ExternalServiceError(AppException):
    """Harici servis yanıt vermedi — 502."""

    status_code = 502
    key = "EXTERNAL_SERVICE_ERROR"
    message = "Harici servis yanıt vermedi."


class OptionalDependencyError(AppException):
    """Opsiyonel bagimlilik eksik — 503."""

    status_code = 503
    key = "OPTIONAL_DEPENDENCY_MISSING"
    message = "Opsiyonel bir bagimlilik eksik."


class DatabaseError(AppException):
    """Veritabanı işlemi sırasında hata — 500."""

    status_code = 500
    key = "DATABASE_ERROR"
    message = "Veritabanı işlemi sırasında bir hata oluştu."


class DatabaseNotReadyError(AppException):
    """Veritabanı şeması hazır değil — 503."""

    status_code = 503
    key = "DATABASE_NOT_READY"
    message = "Veritabanı şeması hazır değil. Lütfen migration/seed adımlarını çalıştırın."


class RateLimitError(AppException):
    """İstek sınırı aşıldı — 429."""

    status_code = 429
    key = "RATE_LIMIT_EXCEEDED"
    message = "İstek sınırı aşıldı. Lütfen biraz bekleyip tekrar deneyin."
