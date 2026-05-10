export type SerializablePrimitive = string | number | boolean;
export type SerializableValue =
  | SerializablePrimitive
  | readonly SerializableValue[]
  | { readonly [key: string]: SerializableValue | null | undefined }
  | null
  | undefined;

type NormalizedSerializableValue =
  | SerializablePrimitive
  | readonly NormalizedSerializableValue[]
  | { readonly [key: string]: NormalizedSerializableValue };

interface KeyParams {
  readonly [key: string]: SerializableValue;
}

function isNormalizedRecord(
  value: NormalizedSerializableValue | undefined,
): value is Record<string, NormalizedSerializableValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSerializableArray(
  value: SerializableValue,
): value is readonly SerializableValue[] {
  return Array.isArray(value);
}

export interface OrderListFilterParams extends KeyParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  customerId?: number | string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductListFilterParams extends KeyParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface InventoryListFilterParams extends KeyParams {
  page?: number;
  pageSize?: number;
  search?: string;
  productId?: number | string;
  belowThreshold?: boolean;
}

export interface InventoryReportFilterParams extends KeyParams {
  dateFrom?: string;
  dateTo?: string;
  productId?: number | string;
  groupBy?: "day" | "week" | "month";
}

export interface ShipmentListFilterParams extends KeyParams {
  page?: number;
  pageSize?: number;
  status?: string;
  carrier?: string;
  search?: string;
  delayed?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

function normalizeValue(
  value: SerializableValue,
): NormalizedSerializableValue | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (isSerializableArray(value)) {
    return value
      .map((item) => normalizeValue(item))
      .filter((item): item is NormalizedSerializableValue => item !== undefined);
  }

  if (typeof value === "object") {
    const record: { readonly [key: string]: SerializableValue } = value;
    const normalizedRecord: Record<string, NormalizedSerializableValue> = {};

    Object.keys(record)
      .sort((leftKey, rightKey) => leftKey.localeCompare(rightKey))
      .forEach((key) => {
        const normalizedItem = normalizeValue(record[key]);

        if (normalizedItem !== undefined) {
          normalizedRecord[key] = normalizedItem;
        }
      });

    return normalizedRecord;
  }

  return value;
}

export function normalizeKeyParams<TParams extends KeyParams>(
  params?: TParams,
): Record<string, NormalizedSerializableValue> | undefined {
  const normalized = normalizeValue(params);

  if (!isNormalizedRecord(normalized)) {
    return undefined;
  }

  if (Object.keys(normalized).length === 0) {
    return undefined;
  }

  return normalized;
}

export function createQueryKeys<const TNamespace extends string>(
  namespace: TNamespace,
) {
  const all = [namespace] as const;

  return {
    all,
    scope: <const TScope extends string>(scope: TScope) =>
      [...all, scope] as const,
    detail: <const TScope extends string, TParams extends KeyParams>(
      scope: TScope,
      params?: TParams,
    ) => {
      const normalizedParams = normalizeKeyParams(params);
      return normalizedParams
        ? ([...all, scope, normalizedParams] as const)
        : ([...all, scope] as const);
    },
  };
}

const auth = createQueryKeys("auth");
const ai = createQueryKeys("ai");
const chat = createQueryKeys("chat");
const orders = createQueryKeys("orders");
const products = createQueryKeys("products");
const inventory = createQueryKeys("inventory");
const shipments = createQueryKeys("shipments");

export const queryKeys = {
  auth: {
    all: auth.all,
    me: () => auth.scope("me"),
  },
  ai: {
    all: ai.all,
    chat: () => ai.scope("chat"),
  },
  chat: {
    all: chat.all,
    history: (sessionId?: string) =>
      sessionId
        ? chat.detail("history", { sessionId })
        : chat.scope("history"),
  },
  orders: {
    all: orders.all,
    list: (filters?: OrderListFilterParams) => orders.detail("list", filters),
    detail: (orderId: number | string) => orders.detail("detail", { orderId }),
    summaryToday: () => orders.scope("summaryToday"),
  },
  products: {
    all: products.all,
    list: (filters?: ProductListFilterParams) =>
      products.detail("list", filters),
    detail: (productId: number | string) =>
      products.detail("detail", { productId }),
    lowStock: () => products.scope("lowStock"),
  },
  inventory: {
    all: inventory.all,
    list: (filters?: InventoryListFilterParams) =>
      inventory.detail("list", filters),
    lowStock: () => inventory.scope("lowStock"),
    report: (filters?: InventoryReportFilterParams) =>
      inventory.detail("report", filters),
  },
  shipments: {
    all: shipments.all,
    list: (filters?: ShipmentListFilterParams) =>
      shipments.detail("list", filters),
    detail: (shipmentId: number | string) =>
      shipments.detail("detail", { shipmentId }),
    delayed: (filters?: ShipmentListFilterParams) =>
      shipments.detail("delayed", filters),
  },
} as const;

export type QueryKeys = typeof queryKeys;
