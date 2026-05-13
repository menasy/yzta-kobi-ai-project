# Merkezi OpenAPI response helper'lari.
# Endpoint'lerde tekrar eden response bloklarini azaltir.

from typing import Any

from app.core import openapi_examples


def _example_content(example: dict[str, Any]) -> dict[str, Any]:
    return {"application/json": {"example": example}}


def unauthorized_response(description: str = "Yetkisiz erisim.") -> dict[int, dict[str, Any]]:
    return {
        401: {
            "description": description,
            "content": _example_content(openapi_examples.UNAUTHORIZED_RESPONSE),
        }
    }


def forbidden_response(description: str = "Admin yetkisi gerekli.") -> dict[int, dict[str, Any]]:
    return {
        403: {
            "description": description,
            "content": _example_content(openapi_examples.FORBIDDEN_RESPONSE),
        }
    }


def validation_error_response(description: str = "Validasyon hatasi.") -> dict[int, dict[str, Any]]:
    return {
        422: {
            "description": description,
            "content": _example_content(openapi_examples.VALIDATION_ERROR_RESPONSE),
        }
    }


def bad_request_response(description: str = "Gecersiz istek.") -> dict[int, dict[str, Any]]:
    return {
        400: {
            "description": description,
            "content": _example_content(openapi_examples.BAD_REQUEST_RESPONSE),
        }
    }


def internal_error_response(description: str = "Beklenmeyen sunucu hatasi.") -> dict[int, dict[str, Any]]:
    return {
        500: {
            "description": description,
            "content": _example_content(openapi_examples.INTERNAL_ERROR_RESPONSE),
        }
    }


def not_found_responses(description: str = "Kayit bulunamadi.") -> dict[int, dict[str, Any]]:
    return {
        404: {
            "description": description,
            "content": _example_content(openapi_examples.NOT_FOUND_RESPONSE),
        }
    }


def common_error_responses() -> dict[int, dict[str, Any]]:
    return {
        **internal_error_response(),
    }


def public_get_responses() -> dict[int, dict[str, Any]]:
    return {
        **common_error_responses(),
    }


def admin_mutation_responses() -> dict[int, dict[str, Any]]:
    return {
        **unauthorized_response(),
        **forbidden_response(),
        **validation_error_response(),
        **internal_error_response(),
    }


def created_responses(
    *,
    data: Any = None,
    message: str = "Kayit olusturuldu.",
    description: str = "Kayit olusturuldu.",
    status_code: int = 201,
) -> dict[int, dict[str, Any]]:
    return {
        status_code: {
            "description": description,
            "content": openapi_examples.example_content(
                data=data,
                message=message,
                status_code=status_code,
            ),
        }
    }
