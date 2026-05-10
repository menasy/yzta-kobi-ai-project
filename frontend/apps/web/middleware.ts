import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware — Route Koruması
 *
 * Kural: Cookie'nin yalnızca VARLIĞI kontrol edilir.
 * Token payload'u parse edilmez veya doğrulanmaz (güvenlik için).
 * Asıl yetkilendirme backend'de yapılır.
 *
 * Korumalı rotalar: /dashboard, /orders, /products, /inventory, /shipments
 * Auth rotaları:    /auth/login, /auth/register
 */

const PROTECTED_PATHS = [
  "/dashboard",
  "/orders",
  "/products",
  "/inventory",
  "/shipments",
];

const AUTH_PATHS = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // HttpOnly cookie varlık kontrolü — içeriği okunmaz
  const hasAuthCookie = request.cookies.has("access_token");

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Korumalı sayfaya cookie olmadan gelindi → login'e yönlendir
  if (isProtectedPath && !hasAuthCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie varken auth sayfasına gelindi → dashboard'a yönlendir
  if (isAuthPath && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Static dosyalar, API route'ları ve Next.js internal'larını atla
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
