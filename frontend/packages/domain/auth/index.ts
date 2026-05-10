// Auth domain public API
// Tipler, API fonksiyonları ve hook'lar buradan export edilir

// Types
export type {
  AuthRole,
  AuthUser,
  LoginFormValues,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
  RegisterFormValues,
  RegisterRequest,
  RegisterResponse,
} from "./types/auth.types";

// Schemas
export { loginSchema, registerSchema } from "./schemas/auth.schema";

// API (Server Components için)
export { getMe, login, logout, refresh, register } from "./api/auth.api";

// Hooks (Client Components için)
export { useLogin } from "./hooks/useLogin";
export { useLogout } from "./hooks/useLogout";
export { useMe } from "./hooks/useMe";
export { useRefresh } from "./hooks/useRefresh";
export { useRegister } from "./hooks/useRegister";
