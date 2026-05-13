import type { ApiResponse } from "@repo/core";
import type { z } from "zod";

import type { loginSchema, registerSchema } from "../schemas/auth.schema";

export type AuthRole = "admin" | "customer" | (string & {});

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: AuthRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  /**
   * Legacy UI compatibility only. The auth API strips this field before
   * sending the documented register payload.
   */
  role?: AuthRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type RegisterResponse = ApiResponse<AuthUser>;
export type LoginResponse = ApiResponse<null>;
export type RefreshResponse = ApiResponse<null>;
export type LogoutResponse = ApiResponse<null>;
export type MeResponse = ApiResponse<AuthUser>;

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
