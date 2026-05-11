import { healthClient } from "../../clients/health-client";
import type { HealthResponse } from "../types/health.types";

const HEALTH_ENDPOINTS = {
  status: "health",
} as const;

export function getHealth(): Promise<HealthResponse> {
  return healthClient.get<HealthResponse["data"]>(HEALTH_ENDPOINTS.status);
}
