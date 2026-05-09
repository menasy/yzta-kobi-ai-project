from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

# T herhangi bir veri tipini temsil eden bir degisken 
T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    """Tüm API yanıtları için standart üst yapı."""
    statusCode: int
    key: str
    message: str
    data: Optional[T] = None
    errors: Optional[List[Any]] = None

class PaginatedData(BaseModel, Generic[T]):
    """Sayfalı (liste) veriler için standart yapı."""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int