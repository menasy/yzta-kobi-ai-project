import type { AuthRole } from "../types/auth.types";

export interface AuthTokenClaims {
  exp?: unknown;
  role?: unknown;
  roles?: unknown;
  user_role?: unknown;
  user?: {
    role?: unknown;
  };
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  try {
    if (typeof atob === "function") {
      return atob(padded);
    }

    const bufferCtor = (globalThis as { Buffer?: typeof Buffer }).Buffer;
    if (bufferCtor) {
      return bufferCtor.from(padded, "base64").toString("utf-8");
    }

    return null;
  } catch {
    return null;
  }
}

export function decodeJwtClaims(token?: string | null): AuthTokenClaims | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  const decodedPayload = decodeBase64Url(payload);

  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as AuthTokenClaims;
  } catch {
    return null;
  }
}

export function extractAuthRoleFromClaims(
  claims: AuthTokenClaims | null,
): AuthRole | null {
  if (!claims) {
    return null;
  }

  if (typeof claims.role === "string") {
    return claims.role;
  }

  if (typeof claims.user_role === "string") {
    return claims.user_role;
  }

  if (Array.isArray(claims.roles)) {
    const [firstRole] = claims.roles;

    if (typeof firstRole === "string") {
      return firstRole;
    }
  }

  if (claims.user && typeof claims.user.role === "string") {
    return claims.user.role;
  }

  return null;
}

export function extractAuthRoleFromToken(
  token?: string | null,
): AuthRole | null {
  return extractAuthRoleFromClaims(decodeJwtClaims(token));
}

export function extractTokenExpiryFromClaims(
  claims: AuthTokenClaims | null,
): number | null {
  if (!claims || typeof claims.exp !== "number" || !Number.isFinite(claims.exp)) {
    return null;
  }

  return claims.exp;
}

export function isJwtExpired(
  token?: string | null,
  nowMs: number = Date.now(),
): boolean {
  const exp = extractTokenExpiryFromClaims(decodeJwtClaims(token));
  if (exp === null) {
    return false;
  }

  return exp * 1000 <= nowMs;
}
