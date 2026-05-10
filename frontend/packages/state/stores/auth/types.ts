export type AuthRole = "admin" | "operator" | (string & {});

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  role: AuthRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSessionLoading: boolean;
}

export interface AuthActions {
  setAuth: (user: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
  clearAuth: () => void;
  setSessionLoading: (isLoading: boolean) => void;
  isAdmin: () => boolean;
}

export type AuthStore = AuthState & AuthActions;

export type AuthStoreInitialState = Partial<AuthState>;
