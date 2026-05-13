import { NextRequest, NextResponse } from "next/server";
import {
  canAccessPath,
  getDefaultPathForRole,
  isAuthPath,
  isProtectedPath,
  resolveKnownAuthRole,
} from "@repo/domain/auth/access/policy";
import { extractAuthRoleFromToken } from "@repo/domain/auth/utils/jwt";

/**
 * Next.js Middleware — Route Koruması
 *
 * Kural: Cookie'den yalnızca role claim'i okunur.
 * Token doğrulaması backend'de yapılır; middleware burada signature verify etmez.
 * Asıl yetkilendirme backend'de yapılır.
 *
 * Korumalı rotalar: /dashboard, /orders, /products, /inventory, /shipments
 * Auth rotaları:    /auth/login, /auth/register
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("access_token")?.value;
  const hasAuthCookie = Boolean(authToken);
  const knownRole = resolveKnownAuthRole(extractAuthRoleFromToken(authToken));
  const loginUrl = new URL("/auth/login", request.url);

  // Korumalı sayfaya cookie olmadan gelindi → login'e yönlendir
  if (isProtectedPath(pathname) && !hasAuthCookie) {
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedPath(pathname) && !knownRole) {
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedPath(pathname) && !canAccessPath(pathname, knownRole)) {
    return NextResponse.redirect(new URL(getDefaultPathForRole(knownRole), request.url));
  }

  // Cookie varken auth sayfasına gelindi → role home'a yönlendir
  if (isAuthPath(pathname) && knownRole) {
    return NextResponse.redirect(
      new URL(getDefaultPathForRole(knownRole), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  // Static dosyalar, API route'ları ve Next.js internal'larını atla
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
