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

const CUSTOMER_ACCESS_ROLES = ["customer"] as const satisfies readonly KnownAuthRole[];
const ADMIN_ACCESS_ROLES = ["admin", "operator"] as const satisfies readonly KnownAuthRole[];
const AUTHENTICATED_ACCESS_ROLES = [
  "admin",
  "operator",
  "customer",
] as const satisfies readonly KnownAuthRole[];

/**
 * ROTA ERİŞİM POLİTİKALARI
 * 
 * Sıralama önemlidir: Daha spesifik rotalar (örn: /orders/my)
 * daha genel rotalardan (örn: /orders) önce tanımlanmalıdır.
 */
const ROUTE_ACCESS_POLICIES = [
  {
    path: "/",
    matchMode: "exact",
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

  // Public Storefront Routes
  {
    path: "/products",
    matchMode: "prefix",
    kind: "public",
  },
  {
    path: "/chat",
    matchMode: "prefix",
    kind: "public",
  },

  // Customer Routes
  {
    path: "/orders/my",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: CUSTOMER_ACCESS_ROLES,
  },

  // Admin / Operator Routes
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
  {
    path: "/notifications",
    matchMode: "prefix",
    kind: "protected",
    allowedRoles: ADMIN_ACCESS_ROLES,
  },
] as const satisfies readonly RouteAccessPolicy[];

const PUBLIC_NAV_ITEMS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Ürünler", href: "/products" },
  { label: "Chat", href: "/chat" },
] as const satisfies readonly AccessNavItem[];

const CUSTOMER_NAV_ITEMS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Ürünler", href: "/products" },
  { label: "Chat", href: "/chat" },
  { label: "Siparişlerim", href: "/orders/my" },
] as const satisfies readonly AccessNavItem[];

const ADMIN_NAV_ITEMS = [
  { label: "Panel", href: "/dashboard" },
  { label: "Ürünler", href: "/dashboard/products" },
  { label: "Siparişler", href: "/orders" },
  { label: "Envanter", href: "/inventory" },
  { label: "Kargo", href: "/shipments" },
  { label: "Bildirimler", href: "/notifications" },
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

export function isKnownAuthRole(
  role: string | null | undefined,
): role is KnownAuthRole {
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
    ROUTE_ACCESS_POLICIES.find((policy) =>
      matchesRoutePolicy(pathname, policy),
    ) ?? null
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
    return "/products";
  }

  if (knownRole === "admin" || knownRole === "operator") {
    return "/dashboard";
  }

  return "/";
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

  return [...PUBLIC_NAV_ITEMS];
}

export function getAdminNavigationItems(
  role?: AuthRole | string | null,
): AccessNavItem[] {
  const knownRole = resolveKnownAuthRole(role);

  if (!knownRole || !(ADMIN_ACCESS_ROLES as readonly string[]).includes(knownRole)) {
    return [];
  }

  return ADMIN_NAV_ITEMS.filter((item) => canAccessPath(item.href, knownRole));
}