import type { ApiResponse } from "@repo/core";
import { productsClient } from "../../clients/products-client";
import { toRequestParams } from "../../clients/request-params";
import type {
  CreateProductResponse,
  DeleteProductResponse,
  LowStockProductsResponse,
  Product,
  ProductCreateRequest,
  ProductId,
  ProductListParams,
  ProductUpdateRequest,
  ProductsResponse,
  UpdateProductResponse,
} from "../types/products.types";

export type ProductResponse = ApiResponse<Product>;

const PRODUCTS_ENDPOINTS = {
  list: "",
  lowStock: "low-stock",
  byId: (id: ProductId) => String(id),
} as const;

export function getProducts(
  params?: ProductListParams,
): Promise<ProductsResponse> {
  return productsClient.get<ProductsResponse["data"]>(
    PRODUCTS_ENDPOINTS.list,
    { params: toRequestParams(params) },
  );
}

export function getProduct(id: ProductId): Promise<ProductResponse> {
  return productsClient.get<ProductResponse["data"]>(
    PRODUCTS_ENDPOINTS.byId(id),
  );
}

export function createProduct(
  data: ProductCreateRequest,
): Promise<CreateProductResponse> {
  return productsClient.post<CreateProductResponse["data"], ProductCreateRequest>(
    PRODUCTS_ENDPOINTS.list,
    data,
  );
}

export function getLowStockProducts(): Promise<LowStockProductsResponse> {
  return productsClient.get<LowStockProductsResponse["data"]>(
    PRODUCTS_ENDPOINTS.lowStock,
  );
}

export function updateProduct(
  id: ProductId,
  data: ProductUpdateRequest,
): Promise<UpdateProductResponse> {
  return productsClient.put<UpdateProductResponse["data"], ProductUpdateRequest>(
    PRODUCTS_ENDPOINTS.byId(id),
    data,
  );
}

export function deleteProduct(id: ProductId): Promise<DeleteProductResponse> {
  return productsClient.delete<DeleteProductResponse["data"]>(
    PRODUCTS_ENDPOINTS.byId(id),
  );
}
