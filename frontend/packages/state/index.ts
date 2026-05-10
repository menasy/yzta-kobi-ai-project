/**
 * @repo/state — Global State Yönetimi
 *
 * TanStack Query (server state) ve Zustand (client state) konfigürasyonları.
 * Kural: Server state → TanStack Query | UI state → Zustand
 * Token asla store'da tutulmaz — auth HttpOnly cookie üzerinden yürür.
 */

// TanStack Query
export {
  createQueryClient,
  exponentialBackoff,
  GC_TIME,
  queryKeys,
  QueryProvider,
  RETRY_BASE_DELAY,
  RETRY_COUNT,
  RETRY_MAX_DELAY,
  shouldRetryQuery,
  STALE_TIME,
} from "./query";
export type {
  ApiListResponse,
  BaseQueryOptions,
  InfiniteQueryParams,
  InventoryListFilterParams,
  InventoryReportFilterParams,
  MutationCallbacks,
  OrderListFilterParams,
  PaginatedResponse,
  ProductListFilterParams,
  QueryKeys,
  QueryParams,
  SerializablePrimitive,
  SerializableValue,
  ShipmentListFilterParams,
} from "./query";

// Zustand Stores
export * from "./stores";
