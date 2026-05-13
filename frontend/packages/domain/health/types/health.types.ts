import type { ApiResponse } from "@repo/core";

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
}

export type HealthResponse = ApiResponse<HealthStatus>;
