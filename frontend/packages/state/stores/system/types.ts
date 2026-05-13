export interface SystemStatusData {
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

export interface SystemStatusError {
  message: string;
  key?: string;
  statusCode?: number;
}

export interface SystemState {
  status: SystemStatusData | null;
  isChecking: boolean;
  lastCheckedAt: string | null;
  error: SystemStatusError | null;
}

export interface SystemActions {
  setStatus: (status: SystemStatusData | null) => void;
  setChecking: (isChecking: boolean) => void;
  setError: (error: SystemStatusError | null) => void;
  resetStatus: () => void;
}

export type SystemStore = SystemState & SystemActions;

export type SystemStoreInitialState = Partial<SystemState>;
