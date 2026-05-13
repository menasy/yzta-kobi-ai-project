"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ApiError } from "@repo/core";
import {
  getChatSendErrorReply,
  useChatHistory,
  useClearChatHistory,
  useSendMessage,
} from "@repo/domain/chat";
import { useUser } from "@repo/state/stores/auth";
import {
  useChatActions,
  useChatSessionId,
  useIsTyping,
  useOptimisticMessages,
} from "@repo/state/stores/chat";
import { useShowError } from "@repo/state/stores/message";
import type { AiAssistantWindowProps } from "@repo/ui-contracts";
import { usePathname } from "next/navigation";

import { AiAssistantHeader } from "./AiAssistantHeader";
import { AiAssistantMessageList } from "./AiAssistantMessageList";
import { AiAssistantInput } from "./AiAssistantInput";
import { AiAssistantErrorState } from "./AiAssistantErrorState";

/**
 * AiAssistantWindow — Panel logic orkestratörü.
 *
 * Mevcut chat domain hook'larını kullanır (useSendMessage, useChatHistory).
 * Session yönetimi, optimistic message, typing indicator, error handling
 * ve scroll davranışını koordine eder.
 *
 * Panel kapalıyken query'ler disabled olur — gereksiz API çağrısı yok.
 */
export function AiAssistantWindow({ isOpen, onClose }: AiAssistantWindowProps) {
  const pathname = usePathname();
  const user = useUser();
  const sessionId = useChatSessionId();
  const {
    ensureSessionId,
    addOptimisticMessage,
    replaceOptimisticMessage,
    appendAssistantMessage,
    setTyping,
    clearChat,
  } = useChatActions();
  const optimisticMessages = useOptimisticMessages();
  const isTyping = useIsTyping();
  const showError = useShowError();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize session on first open
  useEffect(() => {
    if (isOpen && !sessionId) {
      ensureSessionId();
    }
  }, [isOpen, sessionId, ensureSessionId]);

  // Fetch history — disabled when panel closed or no sessionId
  const {
    messages: serverMessages,
    isLoading,
    error: historyError,
    refetch,
  } = useChatHistory(sessionId ?? "", {
    enabled: isOpen && Boolean(sessionId),
  });

  // Send message mutation
  const { sendMessageAsync } = useSendMessage({
    onError: (error: ApiError) => {
      showError("Hata", error.message || "Mesaj gönderilirken bir hata oluştu.");
      setTyping(false);
    },
  });

  // Clear chat mutation
  const { clearChatHistory: clearHistory, isPending: isClearPending } =
    useClearChatHistory({
      onSuccess: () => {
        clearChat();
      },
      onError: (error: ApiError) => {
        showError(
          "Hata",
          error.message || "Konuşma temizlenirken bir hata oluştu.",
        );
      },
    });

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const currentSessionId = ensureSessionId();

      // Optimistic user message
      const tempId = `panel-temp-${Date.now()}`;
      addOptimisticMessage({
        id: tempId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      });

      setTyping(true);

      try {
        const response = await sendMessageAsync({
          session_id: currentSessionId,
          content,
        });

        // Mark user message as confirmed
        replaceOptimisticMessage(tempId, {
          id: tempId,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
          isOptimistic: false,
        });

        // Append assistant reply
        appendAssistantMessage({
          id: `panel-ast-${Date.now()}`,
          content: response.data.reply,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        replaceOptimisticMessage(tempId, {
          id: tempId,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
          isOptimistic: false,
        });
        appendAssistantMessage({
          id: `panel-err-${Date.now()}`,
          content: getChatSendErrorReply(error),
          createdAt: new Date().toISOString(),
        });
      } finally {
        setTyping(false);
      }
    },
    [
      addOptimisticMessage,
      appendAssistantMessage,
      ensureSessionId,
      replaceOptimisticMessage,
      sendMessageAsync,
      setTyping,
    ],
  );

  const handleClearChat = useCallback(() => {
    if (sessionId) {
      clearHistory(sessionId);
    }
  }, [sessionId, clearHistory]);

  // Build context badge
  const contextBadge = buildContextBadge(user?.role ?? null, pathname);

  // Merge server + optimistic messages — avoid duplicates
  const displayedMessages =
    serverMessages.length > 0
      ? serverMessages.concat(
          optimisticMessages.filter((message) => message.isOptimistic),
        )
      : optimisticMessages;

  // History error state
  if (historyError && serverMessages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <AiAssistantHeader
          onClose={onClose}
          onClearChat={handleClearChat}
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
        onClearChat={handleClearChat}
        isClearPending={isClearPending}
        contextBadge={contextBadge}
      />
      <AiAssistantMessageList
        messages={displayedMessages}
        isTyping={isTyping || isLoading}
        bottomRef={bottomRef}
      />
      <AiAssistantInput
        onSendMessage={handleSendMessage}
        isPending={isTyping}
        disabled={isLoading && serverMessages.length === 0}
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
  pathname: string,
): string | null {
  const parts: string[] = [];

  if (role && ROLE_LABELS[role]) {
    parts.push(ROLE_LABELS[role]);
  }

  const pageName = resolvePageName(pathname);
  if (pageName) {
    parts.push(pageName);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function resolvePageName(pathname: string): string | null {
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (pathname.includes("/orders")) return "Siparişler";
  if (pathname.includes("/products")) return "Ürünler";
  if (pathname.includes("/inventory")) return "Envanter";
  if (pathname.includes("/shipments")) return "Kargolar";
  if (pathname.includes("/notifications")) return "Bildirimler";
  if (pathname.includes("/profile")) return "Profil";
  if (pathname === "/") return "Ana Sayfa";
  return null;
}
