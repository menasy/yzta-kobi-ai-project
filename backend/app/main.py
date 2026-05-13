# main.py
# Uygulamanın başlangıç noktası.
# FastAPI app factory, middleware kayıtları, router bağlamaları,
# global exception handler'lar ve startup/shutdown event'leri burada tanımlanır.
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.logger import get_logger, setup_logging
from app.core import openapi_examples
from app.core.response_builder import success_response
from app.core.responses import ApiResponse
from app.core.system_status import get_system_status
from app.db.session import close_db_connections, ensure_schema



from dotenv import load_dotenv
load_dotenv()

# ── Settings ve Logger ───────────────────────────────────

settings = get_settings()

setup_logging(
    level=settings.LOG_LEVEL,
    json_output=settings.LOG_JSON,
)

logger = get_logger("app")


# ── Lifespan ─────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama başlangıç ve kapanış olayları."""
    logger.info(
        "Uygulama başlatılıyor.",
        extra={
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        },
    )
    try:
        await ensure_schema()
    except Exception as exc:
        logger.warning("Schema kontrolu basarisiz: %s", exc)
    yield
    await close_db_connections()
    logger.info("Uygulama kapatıldı.")


# ── FastAPI App ──────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ══════════════════════════════════════════════════════════
# MIDDLEWARE KAYITLARI
# Middleware'ler LIFO sırasıyla çalışır.
# Son eklenen ilk çalışır.
# ══════════════════════════════════════════════════════════


# ── 3. SecurityHeadersMiddleware (son çalışır) ───────────


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Tüm response'lara güvenlik header'ları ekler."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.url.path.startswith("/docs") or request.url.path.startswith("/redoc"):
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com;"
            )
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response


app.add_middleware(SecurityHeadersMiddleware)


# ── 2. CORS Middleware ───────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-Request-ID"],
)


# ── 1. RequestIDMiddleware (ilk çalışır) ─────────────────

request_logger = get_logger("app.request")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Her isteğe benzersiz bir request_id atar.
    - X-Request-ID header varsa onu kullanır, yoksa UUID üretir.
    - request.state.request_id olarak sonraki katmanlara geçer.
    - Response header'ına X-Request-ID ekler.
    - İstek süresini ölçer ve structured log yazar.
    """

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        response.headers["X-Request-ID"] = request_id

        request_logger.info(
            "%s %s → %s",
            request.method,
            request.url.path,
            response.status_code,
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": str(request.url.path),
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response


app.add_middleware(RequestIDMiddleware)


# ══════════════════════════════════════════════════════════
# GLOBAL EXCEPTION HANDLERS
# Tüm hatalar merkezi olarak burada yakalanır.
# Endpoint'lerde try/except yazmaya gerek yoktur.
# ══════════════════════════════════════════════════════════


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Uygulama kaynaklı tüm exception'ları yakalar.
    NotFoundError, InsufficientStockError vb. buraya düşer.
    """
    request_id = getattr(request.state, "request_id", None)

    logger.warning(
        "AppException: %s [%s]",
        exc.message,
        exc.key,
        extra={"request_id": request_id, "status_code": exc.status_code},
    )

    body = ApiResponse(
        statusCode=exc.status_code,
        key=exc.key,
        message=exc.message,
        data=None,
        errors=exc.errors,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=body.model_dump(),
        headers={"X-Request-ID": str(request_id)} if request_id else {},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Pydantic validasyon hatalarını yakalar.
    Hangi alanın neden geçersiz olduğunu döndürür.
    """
    field_errors = [
        {
            "field": " → ".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
        }
        for err in exc.errors()
    ]
    body = ApiResponse(
        statusCode=422,
        key="VALIDATION_ERROR",
        message="İstek verisi geçersiz. Lütfen alanları kontrol edin.",
        data=None,
        errors=field_errors,
    )
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=422,
        content=body.model_dump(),
        headers={"X-Request-ID": str(request_id)} if request_id else {},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """
    Beklenmeyen tüm hataları yakalar.
    Stack trace loglanır ama client'a döndürülmez.
    """
    request_id = getattr(request.state, "request_id", None)

    logger.error(
        "Beklenmeyen hata: %s",
        str(exc),
        exc_info=exc,
        extra={"request_id": request_id},
    )

    body = ApiResponse(
        statusCode=500,
        key="INTERNAL_ERROR",
        message="Beklenmeyen bir hata oluştu.",
        data=None,
        errors=None,
    )
    return JSONResponse(
        status_code=500,
        content=body.model_dump(),
        headers={"X-Request-ID": str(request_id)} if request_id else {},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    error_message = str(exc).lower()

    missing_table = any(
        marker in error_message
        for marker in ["does not exist", "undefined table", "no such table"]
    )
    connection_error = any(
        marker in error_message
        for marker in [
            "connection refused",
            "could not connect",
            "connection is closed",
            "server closed the connection",
        ]
    )

    if missing_table or connection_error:
        status_code = 503
        key = "DATABASE_NOT_READY"
        message = "Veritabani hazir degil. Migration/seed adimlarini kontrol edin."
        logger.warning(
            "Database not ready: %s",
            exc,
            extra={"request_id": request_id, "status_code": status_code},
        )
    else:
        status_code = 500
        key = "DATABASE_ERROR"
        message = "Veritabani islemi sirasinda hata olustu."
        logger.error(
            "Database error: %s",
            exc,
            extra={"request_id": request_id, "status_code": status_code},
        )

    body = ApiResponse(
        statusCode=status_code,
        key=key,
        message=message,
        data=None,
        errors=None,
    )

    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(),
        headers={"X-Request-ID": str(request_id)} if request_id else {},
    )


# ══════════════════════════════════════════════════════════
# ROUTER KAYITLARI
# ══════════════════════════════════════════════════════════

app.include_router(api_router, prefix=settings.API_PREFIX)



# Chat router artık api_router üzerinden /api/chat prefix'i ile kayıtlıdır.
# Bkz: app/api/router.py


# ══════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════


@app.get(
    "/health",
    tags=["Sistem"],
    response_model=None,
    responses={
        200: {
            "description": "Sistem sağlık bilgisi.",
            "content": {
                "application/json": {
                    "example": openapi_examples.get_api_response_example(
                        data={
                            "status": "ok",
                            "app_name": "KOBİ Agent",
                            "version": "0.1.0",
                            "environment": "development",
                            "ready": True,
                            "databaseReady": True,
                            "migrationsReady": True,
                            "seedReady": True,
                            "missingTables": [],
                            "message": "Sistem hazir.",
                        },
                        message="Sistem çalışıyor.",
                    )
                }
            },
        },
        500: {
            "description": "Beklenmeyen sunucu hatası.",
            "content": {
                "application/json": {
                    "example": openapi_examples.INTERNAL_ERROR_RESPONSE
                }
            },
        },
    },
)
async def health_check():
    """Sistem sağlık kontrolü — public endpoint."""
    status_payload = await get_system_status()
    return success_response(
        data=status_payload,
        message=status_payload.get("message", "Sistem durumu okundu."),
    )
