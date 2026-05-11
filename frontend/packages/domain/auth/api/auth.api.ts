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

interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

function toRegisterPayload(data: RegisterRequest): RegisterPayload {
  return {
    email: data.email,
    password: data.password,
    full_name: data.full_name,
  };
}

export function register(data: RegisterRequest): Promise<RegisterResponse> {
  return authClient.post<RegisterResponse["data"], RegisterPayload>(
    "register",
    toRegisterPayload(data),
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
