from pydantic import BaseModel, ConfigDict, Field


class CustomerOrderLookupResponse(BaseModel):
    order_number: str = Field(serialization_alias="orderNumber")
    status: str
    date: str
    total: str

    model_config = ConfigDict(from_attributes=True)


class CustomerStockQueryResponse(BaseModel):
    product_name: str = Field(serialization_alias="productName")
    sku: str
    in_stock: bool = Field(serialization_alias="inStock")
    quantity: int
    location: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CustomerCargoTrackingResponse(BaseModel):
    tracking_number: str = Field(serialization_alias="trackingNumber")
    company: str
    status: str
    estimated_delivery: str = Field(serialization_alias="estimatedDelivery")
    last_update: str = Field(serialization_alias="lastUpdate")

    model_config = ConfigDict(from_attributes=True)
