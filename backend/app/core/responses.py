# core/responses.py
# Tüm API yanıtları bu modeller üzerinden tanımlanır.
# Endpoint'ler ve response_builder bu modelleri kullanır.
# Frontend her zaman aynı response formatını alır.

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    """Tek bir validasyon veya alan hatasını temsil eder."""

    field: str
    message: str


class ApiResponse(BaseModel, Generic[T]):
    """Tüm API yanıtları için temel response modeli."""

    statusCode: int
    key: str
    message: str
    data: T | None = None
    errors: list[Any] | None = None


class PaginatedData(BaseModel, Generic[T]):
    """Sayfalı liste sonuçları için veri sarmalayıcı."""

    items: list[T]
    total: int
    page: int
    size: int
    pages: int
