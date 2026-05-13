import { customerSupportClient } from "../../clients/customer-support-client";
import type {
  CargoTrackingResponse,
  OrderLookupResponse,
  StockQueryResponse,
} from "../types/customer.types";
import type {
  CargoTrackingInput,
  OrderLookupInput,
  StockQueryInput,
} from "../schemas/customer.schema";

export async function lookupOrder(
  input: OrderLookupInput,
): Promise<OrderLookupResponse> {
  return customerSupportClient.get<OrderLookupResponse["data"]>(
    `orders/${encodeURIComponent(input.orderNumber.trim())}`,
  );
}

export async function queryStock(
  input: StockQueryInput,
): Promise<StockQueryResponse> {
  return customerSupportClient.get<StockQueryResponse["data"]>("stock", {
    params: { query: input.query.trim() },
  });
}

export async function trackCargo(
  input: CargoTrackingInput,
): Promise<CargoTrackingResponse> {
  return customerSupportClient.get<CargoTrackingResponse["data"]>(
    `cargo/${encodeURIComponent(input.trackingNumber.trim())}`,
  );
}
