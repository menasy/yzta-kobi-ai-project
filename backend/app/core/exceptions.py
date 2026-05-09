from typing import Any, Dict, Optional
from fastapi import HTTPException, status

class BaseAppException(HTTPException):
    """Tüm uygulama içi özel hataların atası"""
    def __init__(
        self,
        status_code: int,
        key: str,
        message: str,
        data: Optional[Any] = None
    ):
        super().__init__(status_code=status_code, detail=message)
        self.key = key
        self.message = message
        self.data = data

class NotFoundException(BaseAppException):
    """Veri bulunamadığında fırlatılır (HTTP 404)"""
    def __init__(self, message: str = "Kaynak bulunamadı", data: Optional[Any] = None):
        super().__init__(status.HTTP_404_NOT_FOUND, "NOT_FOUND", message, data)

class ValidationException(BaseAppException):
    """Veri doğrulama hatalarında fırlatılır (HTTP 400)"""
    def __init__(self, message: str = "Geçersiz veri", data: Optional[Any] = None):
        super().__init__(status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR", message, data)

class UnauthorizedException(BaseAppException):
    """Yetkisiz erişim denemelerinde fırlatılır (HTTP 401)"""
    def __init__(self, message: str = "Yetkisiz erişim"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", message)