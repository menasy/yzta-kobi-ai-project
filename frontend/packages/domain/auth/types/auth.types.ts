import type { ApiResponse } from "@repo/core";
import type { z } from "zod";

import type { loginSchema, registerSchema } from "../schemas/auth.schema";

export type AuthRole = "admin" | "operator";

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

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string | null;
  role?: AuthRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type RegisterResponse = ApiResponse<AuthUser>;
export type LoginResponse = ApiResponse<AuthUser | null>;
export type RefreshResponse = ApiResponse<null>;
export type LogoutResponse = ApiResponse<null>;
export type MeResponse = ApiResponse<AuthUser>;

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
