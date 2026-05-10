import type { ApiResponse } from "@repo/core";

export type ProductId = number | string;

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  description?: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductCreateRequest {
  name: string;
  sku: string;
  price: number;
  description?: string | null;
  category?: string | null;
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export interface ProductListParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export type ProductsResponse = ApiResponse<Product[]>;
export type LowStockProductsResponse = ApiResponse<Product[]>;
export type CreateProductResponse = ApiResponse<Product>;
export type UpdateProductResponse = ApiResponse<Product>;
export type DeleteProductResponse = ApiResponse<null>;
