# api/endpoints/products.py
# Ürün yönetimi endpoint'leri.
# Sadece routing/response sorumluluğu taşır; business logic ProductService'dedir.

from fastapi import APIRouter, Depends

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import AdminUser, get_product_service
from app.core.response_builder import success_response
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter()


@router.get(
    "",
    response_model=None,
    include_in_schema=False,
)
@router.get(
    "/",
    response_model=None,
    summary="Tüm ürünleri listele",
    description="Public ürün kataloğunu listeler. Login gerekmez.",
    responses={
        200: {
            "description": "Ürünler başarıyla listelendi.",
            "content": openapi_examples.example_content(
                data=[openapi_examples.PRODUCT_EXAMPLE],
                message="Ürünler listelendi.",
            ),
        },
        **openapi_responses.public_get_responses(),
    },
)
async def get_all(
    service: ProductService = Depends(get_product_service),
):
    products = await service.get_all_products()
    return success_response(data=products, message="Ürünler listelendi.")


@router.post(
    "/",
    status_code=201,
    response_model=None,
    summary="Yeni ürün oluştur",
    responses={
        **openapi_responses.created_responses(
            data=openapi_examples.PRODUCT_EXAMPLE,
            message="Ürün başarıyla oluşturuldu.",
            description="Ürün başarıyla oluşturuldu.",
        ),
        **openapi_responses.admin_mutation_responses(),
    },
)
async def create(
    product_in: ProductCreate,
    admin: AdminUser,
    service: ProductService = Depends(get_product_service),
):
    product = await service.create_product(product_in)
    return success_response(data=product, message="Ürün başarıyla oluşturuldu.", status_code=201)


@router.get(
    "/low-stock",
    response_model=None,
    summary="Kritik stok seviyesindeki ürünleri getir",
    responses={
        200: {
            "description": "Kritik stok seviyesindeki ürünler başarıyla getirildi.",
            "content": openapi_examples.example_content(
                data=[openapi_examples.PRODUCT_EXAMPLE],
                message="Kritik stok seviyesindeki ürünler getirildi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def get_low_stock(
    admin: AdminUser,
    service: ProductService = Depends(get_product_service),
):
    products = await service.get_low_stock_products()
    return success_response(data=products, message="Kritik stok seviyesindeki ürünler getirildi.")


@router.get(
    "/{product_id}",
    response_model=None,
    summary="Ürün detayını getir",
    description="Public olarak tek bir ürünün detayını getirir. Login gerekmez.",
    responses={
        200: {
            "description": "Ürün detayı başarıyla getirildi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.PRODUCT_EXAMPLE,
                message="Ürün detayı getirildi.",
            ),
        },
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.public_get_responses(),
    },
)
async def get_by_id(
    product_id: int,
    service: ProductService = Depends(get_product_service),
):
    product = await service.get_product_by_id(product_id)
    return success_response(data=product, message="Ürün detayı getirildi.")


@router.put(
    "/{product_id}",
    response_model=None,
    summary="Ürün güncelle",
    responses={
        200: {
            "description": "Ürün başarıyla güncellendi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.PRODUCT_EXAMPLE,
                message="Ürün güncellendi.",
            ),
        },
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.admin_mutation_responses(),
    },
)
async def update(
    product_id: int,
    product_in: ProductUpdate,
    admin: AdminUser,
    service: ProductService = Depends(get_product_service),
):
    product = await service.update_product(product_id, product_in)
    return success_response(data=product, message="Ürün güncellendi.")


@router.delete(
    "/{product_id}",
    response_model=None,
    summary="Ürün sil",
    responses={
        200: {
            "description": "Ürün başarıyla silindi.",
            "content": openapi_examples.example_content(
                data={"id": 101},
                message="Ürün silindi.",
            ),
        },
        **openapi_responses.not_found_responses(description="Ürün bulunamadı."),
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def delete(
    product_id: int,
    admin: AdminUser,
    service: ProductService = Depends(get_product_service),
):
    await service.delete_product(product_id)
    return success_response(data={"id": product_id}, message="Ürün silindi.")
