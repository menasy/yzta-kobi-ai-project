import type { ApiResponse } from "@repo/core";

export type TrackingNumber = string;
export type ShipmentStatus = string;
export type Carrier = string;

export interface Shipment extends Record<string, unknown> {
  id?: number | string;
  order_id?: number | string;
  tracking_number: TrackingNumber;
  carrier?: Carrier | null;
  status?: ShipmentStatus;
  location: string;
  estimated_delivery_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShipmentRequest extends Record<string, unknown> {
  tracking_number: TrackingNumber;
  order_id?: number | string;
  carrier?: Carrier | null;
  location?: string | null;
}

export type CreateShipmentResponse = ApiResponse<Shipment>;
export type ShipmentResponse = ApiResponse<Shipment>;
