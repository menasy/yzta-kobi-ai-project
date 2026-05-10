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
  return authClient.post<RegisterResponse, RegisterRequest>("register", data);
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return authClient.post<LoginResponse, LoginRequest>("login", data);
}

export function refresh(): Promise<RefreshResponse> {
  return authClient.post<RefreshResponse>("refresh");
}

export function logout(): Promise<LogoutResponse> {
  return authClient.post<LogoutResponse>("logout");
}

export function getMe(): Promise<MeResponse> {
  return authClient.get<MeResponse>("me");
}
