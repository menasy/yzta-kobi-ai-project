import { authClient } from "../../clients/auth-client";
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";

export function register(data: RegisterRequest): Promise<RegisterResponse> {
  return authClient.post<RegisterResponse["data"], RegisterRequest>(
    "register",
    data,
  );
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return authClient.post<LoginResponse["data"], LoginRequest>("login", data);
}

export function refresh(): Promise<RefreshResponse> {
  return authClient.post<RefreshResponse["data"]>("refresh");
}

export function logout(): Promise<LogoutResponse> {
  return authClient.post<LogoutResponse["data"]>("logout");
}

export function getMe(): Promise<MeResponse> {
  return authClient.get<MeResponse["data"]>("me");
}
