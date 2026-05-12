import type { ApiResponse } from "@repo/core";

export type TrackingNumber = string;
export type ShipmentStatus =
  | "created"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "failed"
  | "cancelled";
export type Carrier = string;

export interface ShipmentEvent extends Record<string, unknown> {
  id: number;
  shipment_id: number;
  status: ShipmentStatus;
  location?: string | null;
  description?: string | null;
  event_time?: string | null;
  created_at: string;
}

export interface Shipment extends Record<string, unknown> {
  id: number;
  order_id: number | string;
  tracking_number: TrackingNumber;
  carrier: Carrier;
  status: ShipmentStatus;
  location?: string | null;
  estimated_delivery_date?: string | null;
  delivered_at?: string | null;
  last_checked_at?: string | null;
  created_at?: string;
  updated_at?: string;
  events?: ShipmentEvent[];
}

export interface CreateShipmentRequest extends Record<string, unknown> {
  order_id: number;
  carrier: Carrier;
  tracking_number?: TrackingNumber | null;
  location?: string | null;
  estimated_delivery_date?: string | null;
}

export interface ShipmentListParams
  extends Record<string, string | number | boolean | null | undefined> {
  status?: ShipmentStatus;
  carrier?: Carrier;
  skip?: number;
  limit?: number;
}

export type CreateShipmentResponse = ApiResponse<Shipment>;
export type ShipmentResponse = ApiResponse<Shipment>;
export type ShipmentsResponse = ApiResponse<Shipment[]>;
export type DelayedShipmentsResponse = ApiResponse<Shipment[]>;
export type RefreshShipmentResponse = ApiResponse<Shipment>;
