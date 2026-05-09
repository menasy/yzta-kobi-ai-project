# main.py
# Uygulamanın başlangıç noktası.
# FastAPI app factory, middleware kayıtları, router bağlamaları,
# global exception handler'lar ve startup/shutdown event'leri burada tanımlanır.
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.logger import get_logger, setup_logging
from app.core.response_builder import error_response, success_response
from app.core.responses import ApiResponse
from app.db.session import close_db_connections

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
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response


app.add_middleware(SecurityHeadersMiddleware)


# ── 2. CORS Middleware ───────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
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
    return JSONResponse(status_code=422, content=body.model_dump())


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


# ══════════════════════════════════════════════════════════
# ROUTER KAYITLARI
# ══════════════════════════════════════════════════════════

app.include_router(api_router, prefix=settings.API_PREFIX)


# ══════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════


@app.get("/health", tags=["Sistem"])
async def health_check():
    """Sistem sağlık kontrolü — public endpoint."""
    return success_response(
        data={
            "status": "ok",
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        },
        message="Sistem çalışıyor.",
    )
