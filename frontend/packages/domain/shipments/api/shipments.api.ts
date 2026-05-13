import { shipmentsClient } from "../../clients/shipments-client";
import { toRequestParams } from "../../clients/request-params";
import type {
  CreateShipmentRequest,
  CreateShipmentResponse,
  DelayedShipmentsResponse,
  RefreshShipmentResponse,
  ShipmentListParams,
  ShipmentResponse,
  ShipmentsResponse,
  TrackingNumber,
} from "../types/shipments.types";

const SHIPMENTS_ENDPOINTS = {
  list: "",
  delayed: "delayed",
  byTrackingNumber: (trackingNumber: TrackingNumber) => trackingNumber,
  refresh: (trackingNumber: TrackingNumber) => `${trackingNumber}/refresh`,
} as const;

export function createShipment(
  data: CreateShipmentRequest,
): Promise<CreateShipmentResponse> {
  return shipmentsClient.post<CreateShipmentResponse["data"], CreateShipmentRequest>(
    SHIPMENTS_ENDPOINTS.list,
    data,
  );
}

export function getShipments(
  params?: ShipmentListParams,
): Promise<ShipmentsResponse> {
  return shipmentsClient.get<ShipmentsResponse["data"]>(
    SHIPMENTS_ENDPOINTS.list,
    { params: toRequestParams(params) },
  );
}

export function getShipment(
  trackingNumber: TrackingNumber,
): Promise<ShipmentResponse> {
  return shipmentsClient.get<ShipmentResponse["data"]>(
    SHIPMENTS_ENDPOINTS.byTrackingNumber(trackingNumber),
  );
}

export function refreshShipment(
  trackingNumber: TrackingNumber,
): Promise<RefreshShipmentResponse> {
  return shipmentsClient.patch<RefreshShipmentResponse["data"]>(
    SHIPMENTS_ENDPOINTS.refresh(trackingNumber),
  );
}

export function getDelayedShipments(
  params?: Pick<ShipmentListParams, "skip" | "limit">,
): Promise<DelayedShipmentsResponse> {
  return shipmentsClient.get<DelayedShipmentsResponse["data"]>(
    SHIPMENTS_ENDPOINTS.delayed,
    { params: toRequestParams(params) },
  );
}
