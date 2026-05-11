import type { AuthRole } from "../types/auth.types";

export const KNOWN_AUTH_ROLES = ["admin", "customer", "operator"] as const;
export type KnownAuthRole = (typeof KNOWN_AUTH_ROLES)[number];

export interface AccessNavItem {
  label: string;
  href: string;
  icon?: string;
}

type RouteMatchMode = "exact" | "prefix";
type RouteAccessKind = "public" | "auth" | "protected";

interface RouteAccessPolicy {
  path: string;
  matchMode: RouteMatchMode;
  kind: RouteAccessKind;
  allowedRoles?: readonly KnownAuthRole[];
}

const ADMIN_ACCESS_ROLES = ["admin", "operator"] as const satisfies readonly KnownAuthRole[];

const ROUTE_ACCESS_POLICIES = [
  {
    path: "/",
    matchMode: "exact",
    kind: "public",
  },
  {
    path: "/chat",
    matchMode: "prefix",
    kind: "public",
  },
  {
    path: "/auth/login",
    matchMode: "exact",
    kind: "auth",
  },
  {
    path: "/auth/register",
    matchMode: "exact",
    kind: "auth",
  },
  {
    path: "/dashboard",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: ADMIN_ACCESS_ROLES,
  },
  {
    path: "/orders",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: ADMIN_ACCESS_ROLES,
  },
  {
    path: "/products",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: ADMIN_ACCESS_ROLES,
  },
  {
    path: "/inventory",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: ADMIN_ACCESS_ROLES,
  },
  {
    path: "/shipments",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: ADMIN_ACCESS_ROLES,
  },
] as const satisfies readonly RouteAccessPolicy[];

const PUBLIC_NAV_ITEMS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "AI Chat", href: "/chat" },
] as const satisfies readonly AccessNavItem[];

const CUSTOMER_NAV_ITEMS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "AI Chat", href: "/chat" },
] as const satisfies readonly AccessNavItem[];

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Ürünler", href: "/products", icon: "🏷️" },
  { label: "Siparişler", href: "/orders", icon: "📦" },
  { label: "Envanter", href: "/inventory", icon: "🗃️" },
  { label: "Kargo", href: "/shipments", icon: "🚚" },
] as const satisfies readonly AccessNavItem[];

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function matchesRoutePolicy(
  pathname: string,
  policy: RouteAccessPolicy,
): boolean {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedPolicyPath = normalizePathname(policy.path);

  if (policy.matchMode === "exact") {
    return normalizedPathname === normalizedPolicyPath;
  }

  return (
    normalizedPathname === normalizedPolicyPath ||
    normalizedPathname.startsWith(`${normalizedPolicyPath}/`)
  );
}

export function isKnownAuthRole(role: string | null | undefined): role is KnownAuthRole {
  return (
    typeof role === "string" &&
    (KNOWN_AUTH_ROLES as readonly string[]).includes(role)
  );
}

export function resolveKnownAuthRole(
  role: AuthRole | string | null | undefined,
): KnownAuthRole | null {
  return isKnownAuthRole(role) ? role : null;
}

export function getRouteAccessPolicy(pathname: string): RouteAccessPolicy | null {
  return (
    ROUTE_ACCESS_POLICIES.find((policy) => matchesRoutePolicy(pathname, policy)) ??
    null
  );
}

export function isAuthPath(pathname: string): boolean {
  return getRouteAccessPolicy(pathname)?.kind === "auth";
}

export function isProtectedPath(pathname: string): boolean {
  return getRouteAccessPolicy(pathname)?.kind === "protected";
}

export function canAccessPath(
  pathname: string,
  role: AuthRole | string | null | undefined,
): boolean {
  const policy = getRouteAccessPolicy(pathname);

  if (!policy || policy.kind !== "protected") {
    return true;
  }

  const knownRole = resolveKnownAuthRole(role);

  if (!knownRole || !policy.allowedRoles) {
    return false;
  }

  return policy.allowedRoles.includes(knownRole);
}

export function getDefaultPathForRole(
  role: AuthRole | string | null | undefined,
): string {
  const knownRole = resolveKnownAuthRole(role);

  if (knownRole === "customer") {
    return "/chat";
  }

  if (knownRole === "admin" || knownRole === "operator") {
    return "/dashboard";
  }

  return "/auth/login";
}

export function getPrimaryNavigationItems(options: {
  isAuthenticated: boolean;
  role?: AuthRole | string | null;
}): AccessNavItem[] {
  const { isAuthenticated, role } = options;
  const knownRole = resolveKnownAuthRole(role);

  if (!isAuthenticated) {
    return [...PUBLIC_NAV_ITEMS];
  }

  if (knownRole === "customer") {
    return [...CUSTOMER_NAV_ITEMS];
  }

  if (knownRole === "admin" || knownRole === "operator") {
    return ADMIN_NAV_ITEMS.filter((item) => canAccessPath(item.href, knownRole));
  }

  return [];
}

export function getAdminNavigationItems(
  role?: AuthRole | string | null,
): AccessNavItem[] {
  const knownRole = resolveKnownAuthRole(role);

  if (!knownRole) {
    return [];
  }

  return ADMIN_NAV_ITEMS.filter((item) => canAccessPath(item.href, knownRole));
}
