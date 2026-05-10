import { shipmentsClient } from "../../clients/shipments-client";
import type {
  CreateShipmentRequest,
  CreateShipmentResponse,
  ShipmentResponse,
  TrackingNumber,
} from "../types/shipments.types";

const SHIPMENTS_ENDPOINTS = {
  create: "",
  byTrackingNumber: (trackingNumber: TrackingNumber) => trackingNumber,
} as const;

export function createShipment(
  data: CreateShipmentRequest,
): Promise<CreateShipmentResponse> {
  return shipmentsClient.post<CreateShipmentResponse["data"], CreateShipmentRequest>(
    SHIPMENTS_ENDPOINTS.create,
    data,
  );
}

export function getShipment(
  trackingNumber: TrackingNumber,
): Promise<ShipmentResponse> {
  return shipmentsClient.get<ShipmentResponse["data"]>(
    SHIPMENTS_ENDPOINTS.byTrackingNumber(trackingNumber),
  );
}
