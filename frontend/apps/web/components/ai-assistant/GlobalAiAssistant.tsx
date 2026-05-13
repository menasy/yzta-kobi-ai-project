"use client";

import { useIsAuthenticated } from "@repo/state/stores/auth";
import { AiAssistantPanel } from "@repo/ui-web";
import { usePathname } from "next/navigation";

/**
 * GlobalAiAssistant — Layout seviyesinde mount edilen client wrapper.
 *
 * - /chat sayfasında render edilmez (mevcut Chat sayfası korunur).
 * - Authenticated olmayan kullanıcılara gösterilmez.
 * - Root ChatStoreProvider'ı kullanır; /chat sayfası ile aynı session'a bağlıdır.
 */
export function GlobalAiAssistant() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();

  // /chat sayfasında panel gösterilmez
  if (pathname.startsWith("/chat")) {
    return null;
  }

  // Auth olmadan panel gösterilmez
  if (!isAuthenticated) {
    return null;
  }

  return <AiAssistantPanel />;
}
