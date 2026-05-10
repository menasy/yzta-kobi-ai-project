# core/logger.py
# Structured JSON logging sistemi.
# Tüm log satırları JSON formatında üretilir.
# setup_logging() uygulama başlarken bir kez çağrılır.
# Kodun hiçbir yerinde print() kullanılmaz; get_logger() ile logger alınır.

import json
import logging
import sys
from datetime import datetime, timezone

# Hassas veri loglanmamalı
_SENSITIVE_FIELDS = frozenset({
    "password", "secret", "token", "api_key", "authorization",
    "secret_key", "llm_api_key", "cargo_api_key",
})


class JsonFormatter(logging.Formatter):
    """Her log satırını JSON formatında üretir. Türkçe karakter desteği sağlar."""

    def format(self, record: logging.LogRecord) -> str:
        log_data: dict = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Ekstra alanlar (request_id, user_id, method, path vb.)
        extra_keys = (
            "request_id", "user_id", "method", "path",
            "status_code", "duration_ms",
        )
        for key in extra_keys:
            value = getattr(record, key, None)
            if value is not None:
                log_data[key] = value

        # Exception bilgisi
        if record.exc_info and record.exc_info[1] is not None:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data, ensure_ascii=False, default=str)


class SimpleFormatter(logging.Formatter):
    """Development ortamı için okunabilir text formatter."""

    FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    def __init__(self) -> None:
        super().__init__(fmt=self.FORMAT, datefmt="%Y-%m-%d %H:%M:%S")


_logging_configured = False


def setup_logging(
    level: str = "INFO",
    json_output: bool = True,
) -> None:
    """
    Uygulama başlarken bir kez çağrılır.
    İdempotent: tekrar çağrıldığında handler çoğaltmaz.
    """
    global _logging_configured  # noqa: PLW0603
    if _logging_configured:
        return
    _logging_configured = True

    log_level = getattr(logging, level.upper(), logging.INFO)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Mevcut handler'ları temizle
    root_logger.handlers.clear()

    # Handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if json_output:
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(SimpleFormatter())

    root_logger.addHandler(handler)

    # Üçüncü parti kütüphanelerin log seviyesini kıs
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Belirtilen isimle logger döndürür.

    Kullanım:
        logger = get_logger(__name__)
        logger.info("Sipariş oluşturuldu.", extra={"request_id": rid})
    """
    return logging.getLogger(name)
