# api/endpoints/orders.py
# Customer direct checkout ve admin sipariş yönetimi endpoint'leri.

from fastapi import APIRouter, Depends, Query

from app.core import openapi_examples, openapi_responses
from app.core.dependencies import AdminUser, CurrentUser, get_order_service
from app.core.response_builder import success_response
from app.schemas.order import CustomerOrderCreate, OrderStatusUpdate
from app.services.order_service import OrderService

router = APIRouter()


@router.post(
    "",
    status_code=201,
    response_model=None,
    summary="Customer direct checkout siparişi oluştur",
    description=(
        "Login olmuş customer kullanıcı, frontend client state'inden gelen ürünleri "
        "direct checkout request'iyle siparişe dönüştürür. Cart/guest sipariş desteklenmez."
    ),
    responses={
        **openapi_responses.created_responses(
            data=openapi_examples.CUSTOMER_ORDER_RESPONSE_EXAMPLE,
            message="Sipariş oluşturuldu.",
            description="Sipariş oluşturuldu.",
        ),
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Customer hesabı gerekli."),
        409: {
            "description": "Stok yetersiz.",
            "content": {"application/json": {"example": openapi_examples.INSUFFICIENT_STOCK_RESPONSE}},
        },
        **openapi_responses.validation_error_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def create_customer_order(
    payload: CustomerOrderCreate,
    current_user: CurrentUser,
    service: OrderService = Depends(get_order_service),
):
    order = await service.create_customer_order(current_user, payload)
    return success_response(
        data=order,
        message="Sipariş oluşturuldu.",
        status_code=201,
    )


@router.get(
    "/my",
    response_model=None,
    summary="Kendi siparişlerimi listele",
    responses={
        200: {
            "description": "Siparişler listelendi.",
            "content": openapi_examples.example_content(
                data=[openapi_examples.CUSTOMER_ORDER_RESPONSE_EXAMPLE],
                message="Siparişler listelendi.",
            ),
        },
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Customer hesabı gerekli."),
        **openapi_responses.internal_error_response(),
    },
)
async def list_my_orders(
    current_user: CurrentUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=200, description="Sayfa başına kayıt"),
    status: str | None = Query(default=None, description="Sipariş durumu filtresi"),
    service: OrderService = Depends(get_order_service),
):
    orders = await service.get_my_orders(
        current_user,
        skip=skip,
        limit=limit,
        status=status,
    )
    return success_response(data=orders, message="Siparişler listelendi.")


@router.get(
    "/my/{order_id}",
    response_model=None,
    summary="Kendi sipariş detayımı getir",
    responses={
        200: {
            "description": "Sipariş detayı alındı.",
            "content": openapi_examples.example_content(
                data=openapi_examples.CUSTOMER_ORDER_RESPONSE_EXAMPLE,
                message="Sipariş detayı alındı.",
            ),
        },
        **openapi_responses.unauthorized_response(description="Login gerekli."),
        **openapi_responses.forbidden_response(description="Customer hesabı gerekli."),
        **openapi_responses.not_found_responses(description="Sipariş bulunamadı."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_my_order_detail(
    order_id: int,
    current_user: CurrentUser,
    service: OrderService = Depends(get_order_service),
):
    order = await service.get_my_order_detail(current_user, order_id)
    return success_response(data=order, message="Sipariş detayı alındı.")


@router.get(
    "",
    response_model=None,
    summary="Admin tüm siparişleri listele",
    responses={
        200: {
            "description": "Siparişler listelendi.",
            "content": openapi_examples.example_content(
                data=[openapi_examples.ADMIN_ORDER_RESPONSE_EXAMPLE],
                message="Siparişler listelendi.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def list_orders(
    admin: AdminUser,
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=200, description="Sayfa başına kayıt"),
    status: str | None = Query(default=None, description="Sipariş durumu filtresi"),
    service: OrderService = Depends(get_order_service),
):
    orders = await service.get_admin_orders(skip=skip, limit=limit, status=status)
    return success_response(data=orders, message="Siparişler listelendi.")


@router.get(
    "/summary/today",
    response_model=None,
    summary="Günlük dashboard özeti",
    responses={
        200: {
            "description": "Günlük özet hazır.",
            "content": openapi_examples.example_content(
                data=openapi_examples.ORDER_SUMMARY_EXAMPLE,
                message="Günlük özet hazır.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.internal_error_response(),
    },
)
async def get_today_summary(
    admin: AdminUser,
    service: OrderService = Depends(get_order_service),
):
    summary = await service.get_today_summary()
    return success_response(data=summary, message="Günlük özet hazır.")


@router.get(
    "/dashboard/overview",
    response_model=None,
    summary="Admin dashboard genel bakış özeti",
    responses={
        200: {
            "description": "Dashboard özeti hazırlandı.",
            "content": openapi_examples.example_content(
                data=openapi_examples.DASHBOARD_OVERVIEW_EXAMPLE,
                message="Dashboard özeti hazırlandı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(description="Admin yetkisi gerekli."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_dashboard_overview(
    admin: AdminUser,
    service: OrderService = Depends(get_order_service),
):
    overview = await service.get_dashboard_overview()
    return success_response(data=overview, message="Dashboard özeti hazırlandı.")


@router.get(
    "/{order_id}",
    response_model=None,
    summary="Admin sipariş detayını getir",
    responses={
        200: {
            "description": "Sipariş detayı alındı.",
            "content": openapi_examples.example_content(
                data=openapi_examples.ADMIN_ORDER_RESPONSE_EXAMPLE,
                message="Sipariş detayı alındı.",
            ),
        },
        **openapi_responses.unauthorized_response(),
        **openapi_responses.forbidden_response(),
        **openapi_responses.not_found_responses(description="Sipariş bulunamadı."),
        **openapi_responses.internal_error_response(),
    },
)
async def get_order_detail(
    order_id: int,
    admin: AdminUser,
    service: OrderService = Depends(get_order_service),
):
    order = await service.get_admin_order_detail(order_id)
    return success_response(data=order, message="Sipariş detayı alındı.")


@router.patch(
    "/{order_id}/status",
    response_model=None,
    summary="Admin sipariş durumunu güncelle",
    responses={
        200: {
            "description": "Sipariş durumu güncellendi.",
            "content": openapi_examples.example_content(
                data=openapi_examples.ADMIN_ORDER_RESPONSE_EXAMPLE,
                message="Sipariş durumu güncellendi.",
            ),
        },
        **openapi_responses.not_found_responses(description="Sipariş bulunamadı."),
        **openapi_responses.admin_mutation_responses(),
    },
)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    admin: AdminUser,
    service: OrderService = Depends(get_order_service),
):
    order = await service.update_order_status(order_id, payload, admin)
    return success_response(data=order, message="Sipariş durumu güncellendi.")
