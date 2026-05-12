import { ApiError } from "@repo/core";

import type {
  CargoTrackingData,
  CargoTrackingResponse,
  OrderLookupData,
  OrderLookupResponse,
  StockQueryData,
  StockQueryResponse,
} from "../types/customer.types";
import type {
  CargoTrackingInput,
  OrderLookupInput,
  StockQueryInput,
} from "../schemas/customer.schema";

const MOCK_LATENCY_MS = 450;

function waitForMockLatency(): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, MOCK_LATENCY_MS);
  });
}

function successResponse<TData>(message: string, data: TData): {
  statusCode: 200;
  key: "SUCCESS";
  message: string;
  data: TData;
  errors: null;
} {
  return {
    statusCode: 200,
    key: "SUCCESS",
    message,
    data,
    errors: null,
  };
}

function throwMockApiError(
  message: string,
  key: string,
  statusCode = 404,
): never {
  throw new ApiError(message, key, statusCode, null);
}

/**
 * Customer support lookup API.
 *
 * Backend'de bu public/customer lookup endpointleri henuz yok. Bu nedenle
 * domain API sozlesmesi korunarak mock yanit uretilir. Gercek endpointler
 * eklendiginde component/hook degismeden sadece bu dosya ApiClient'a tasinir.
 */
export async function lookupOrder(
  input: OrderLookupInput,
): Promise<OrderLookupResponse> {
  await waitForMockLatency();

  const orderNumber = input.orderNumber.trim().toUpperCase();

  if (orderNumber.startsWith("ERR") || orderNumber.startsWith("000")) {
    throwMockApiError(
      "Sipariş bulunamadı. Lütfen numaranızı kontrol edip tekrar deneyin.",
      "ORDER_NOT_FOUND",
    );
  }

  const data: OrderLookupData = {
    orderNumber,
    status: orderNumber.endsWith("1") ? "Teslim Edildi" : "Hazırlanıyor",
    date: new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date()),
    total: "1.250,00 TL",
  };

  return successResponse("Sipariş başarıyla bulundu.", data);
}

export async function queryStock(
  input: StockQueryInput,
): Promise<StockQueryResponse> {
  await waitForMockLatency();

  const query = input.query.trim();
  const normalizedQuery = query.toLocaleLowerCase("tr-TR");
  const isUnavailable =
    normalizedQuery === "yok" || normalizedQuery.includes("tükendi");

  const data: StockQueryData = {
    productName: query,
    sku: isUnavailable
      ? "UKN-000"
      : `SKU-${
          query.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "1001"
        }`,
    inStock: !isUnavailable,
    quantity: isUnavailable ? 0 : 24,
    location: isUnavailable ? undefined : "Ana Depo",
  };

  return successResponse("Stok durumu sorgulandı.", data);
}

export async function trackCargo(
  input: CargoTrackingInput,
): Promise<CargoTrackingResponse> {
  await waitForMockLatency();

  const trackingNumber = input.trackingNumber.trim().toUpperCase();

  if (trackingNumber.startsWith("000")) {
    throwMockApiError(
      "Kargo bulunamadı veya henüz sisteme girilmedi.",
      "CARGO_NOT_FOUND",
    );
  }

  const data: CargoTrackingData = {
    trackingNumber,
    company: "Yurtiçi Kargo",
    status: trackingNumber.endsWith("1") ? "Teslim Edildi" : "Dağıtıma Çıktı",
    estimatedDelivery: trackingNumber.endsWith("1")
      ? "Teslim edildi"
      : "Bugün 18:00",
    lastUpdate: trackingNumber.endsWith("1")
      ? "Alıcıya teslim edildi."
      : "Paket dağıtım merkezinden çıktı.",
  };

  return successResponse("Kargo durumu başarıyla getirildi.", data);
}
