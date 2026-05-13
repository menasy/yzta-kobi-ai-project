"use client";

import {
  AiPanelChatStoreProvider,
} from "@repo/state/stores/ai-panel";
import {
  useIsAuthenticated,
} from "@repo/state/stores/auth";
import { AiAssistantPanel } from "@repo/ui-web";
import { usePathname } from "next/navigation";

/**
 * GlobalAiAssistant — Layout seviyesinde mount edilen client wrapper.
 *
 * - /chat sayfasında render edilmez (mevcut Chat sayfası korunur).
 * - Authenticated olmayan kullanıcılara gösterilmez.
 * - AiPanelChatStoreProvider ile panelin ChatStore'u izole edilir.
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

  return (
    <AiPanelChatStoreProvider>
      <AiAssistantPanel />
    </AiPanelChatStoreProvider>
  );
}
