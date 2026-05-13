const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

export function resolveAuthRedirectPath(
  from?: string | null,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
): string {
  if (!from) {
    return fallback;
  }

  if (!from.startsWith("/") || from.startsWith("//")) {
    return fallback;
  }

  if (from.startsWith("/auth")) {
    return fallback;
  }

  return from;
}

export { DEFAULT_AUTH_REDIRECT_PATH };
