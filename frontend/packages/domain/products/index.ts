export type {
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
} from "./types/products.types";

export {
  createProduct,
  deleteProduct,
  getLowStockProducts,
  getProducts,
  updateProduct,
} from "./api/products.api";

export { useCreateProduct } from "./hooks/useCreateProduct";
export { useDeleteProduct } from "./hooks/useDeleteProduct";
export { useLowStockProducts } from "./hooks/useLowStockProducts";
export { useProducts } from "./hooks/useProducts";
export { useUpdateProduct } from "./hooks/useUpdateProduct";
