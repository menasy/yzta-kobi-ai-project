import type { AiPageContext } from "../types/ai-actions.types";

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function mapPathnameToAiPageContext(
  pathname: string,
): AiPageContext | null {
  const normalizedPathname = normalizePathname(pathname);

  const productDetailMatch = normalizedPathname.match(
    /^\/dashboard\/products\/([^/]+)$/,
  );
  if (productDetailMatch) {
    return {
      page: "products",
      pathname: normalizedPathname,
      selectedProductId: decodeURIComponent(productDetailMatch[1]),
    };
  }

  if (normalizedPathname === "/dashboard/products") {
    return {
      page: "products",
      pathname: normalizedPathname,
    };
  }

  const orderDetailMatch = normalizedPathname.match(/^\/orders\/([^/]+)$/);
  if (orderDetailMatch && orderDetailMatch[1] !== "my") {
    return {
      page: "orders",
      pathname: normalizedPathname,
      selectedOrderId: decodeURIComponent(orderDetailMatch[1]),
    };
  }

  if (normalizedPathname === "/orders") {
    return {
      page: "orders",
      pathname: normalizedPathname,
    };
  }

  const shipmentDetailMatch = normalizedPathname.match(/^\/shipments\/([^/]+)$/);
  if (shipmentDetailMatch) {
    return {
      page: "shipments",
      pathname: normalizedPathname,
      selectedTrackingNumber: decodeURIComponent(shipmentDetailMatch[1]),
    };
  }

  if (normalizedPathname === "/shipments") {
    return {
      page: "shipments",
      pathname: normalizedPathname,
    };
  }

  if (normalizedPathname === "/inventory") {
    return {
      page: "inventory",
      pathname: normalizedPathname,
    };
  }

  if (normalizedPathname === "/notifications") {
    return {
      page: "notifications",
      pathname: normalizedPathname,
    };
  }

  if (normalizedPathname === "/dashboard") {
    return {
      page: "dashboard",
      pathname: normalizedPathname,
    };
  }

  if (normalizedPathname === "/chat") {
    return {
      page: "chat",
      pathname: normalizedPathname,
    };
  }

  return null;
}
