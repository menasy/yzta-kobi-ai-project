import type { ApiResponse } from "@repo/core";

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  ready: boolean;
  databaseReady: boolean;
  migrationsReady: boolean;
  seedReady: boolean;
  missingTables: string[];
  message: string;
}

export type HealthResponse = ApiResponse<HealthStatus>;
