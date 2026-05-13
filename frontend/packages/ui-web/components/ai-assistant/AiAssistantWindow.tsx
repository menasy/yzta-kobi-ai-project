"use client";

import { useCallback, useRef } from "react";
import {
  buildAiContextPrompt,
  getAiPageLabel,
  mapPathnameToAiPageContext,
} from "@repo/domain/ai-actions";
import { useChatController } from "@repo/domain/chat";
import { useUser } from "@repo/state/stores/auth";
import { useChatSessionId } from "@repo/state/stores/chat";
import type { AiAssistantWindowProps } from "@repo/ui-contracts";
import { usePathname } from "next/navigation";

import { AdminAiQuickActions } from "../ai-actions/AdminAiQuickActions";
import { ChatMessageList } from "../chat/ChatMessageList";
import { AiAssistantHeader } from "./AiAssistantHeader";
import { AiAssistantInput } from "./AiAssistantInput";
import { AiAssistantErrorState } from "./AiAssistantErrorState";

/**
 * AiAssistantWindow — Panel logic orkestratörü.
 *
 * Panel, tam sayfa chat ile aynı controller ve aynı renderer yolunu kullanır.
 * Panel kapalıyken query'ler disabled olur.
 */
export function AiAssistantWindow({ isOpen, onClose }: AiAssistantWindowProps) {
  const pathname = usePathname();
  const user = useUser();
  const sessionId = useChatSessionId();
  const bottomRef = useRef<HTMLDivElement>(null);
  const pageContext = mapPathnameToAiPageContext(pathname);
  const {
    displayedMessages,
    serverMessages,
    sendTextMessage,
    clearConversation,
    isTyping,
    isLoading,
    isClearPending,
    error: historyError,
    refetch,
  } = useChatController({
    sessionId,
    enabled: isOpen,
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendTextMessage(content);
    },
    [sendTextMessage],
  );

  const handleClearChat = useCallback(async () => {
    await clearConversation();
  }, [clearConversation]);

  const handleQuickAction = useCallback(
    async (prompt: string) => {
      await handleSendMessage(buildAiContextPrompt(prompt, pageContext));
    },
    [handleSendMessage, pageContext],
  );

  const contextBadge = buildContextBadge(user?.role ?? null, pageContext);

  // History error state
  if (historyError && serverMessages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <AiAssistantHeader
          onClose={onClose}
          onClearChat={() => {
            void handleClearChat();
          }}
          isClearPending={isClearPending}
          contextBadge={contextBadge}
        />
        <AiAssistantErrorState
          message={historyError.message}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <AiAssistantHeader
        onClose={onClose}
        onClearChat={() => {
          void handleClearChat();
        }}
        isClearPending={isClearPending}
        contextBadge={contextBadge}
      />
      {user?.role === "admin" ? (
        <AdminAiQuickActions
          pageContext={pageContext}
          onSelectPrompt={handleQuickAction}
          isPending={isTyping}
        />
      ) : null}
      <ChatMessageList
        messages={displayedMessages}
        isTyping={isTyping || isLoading}
        bottomRef={bottomRef}
        surface="panel"
        onActionMessage={sendTextMessage}
      />
      <AiAssistantInput
        onSendMessage={handleSendMessage}
        isPending={isTyping}
        disabled={isTyping || (isLoading && serverMessages.length === 0)}
      />
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  customer: "Müşteri",
};

function buildContextBadge(
  role: string | null,
  pageContext: ReturnType<typeof mapPathnameToAiPageContext>,
): string | null {
  const parts: string[] = [];

  if (role && ROLE_LABELS[role]) {
    parts.push(ROLE_LABELS[role]);
  }

  if (pageContext) {
    parts.push(getAiPageLabel(pageContext.page));
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
