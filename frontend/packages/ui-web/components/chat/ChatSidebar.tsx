"use client";

import { MessageSquarePlus } from "lucide-react";

import { useChatConversations, useDeleteChatConversation } from "@repo/domain/chat";
import { useShowError, useShowSuccess } from "@repo/state/stores/message";

import { Button } from "../shadcn/button";
import { Skeleton } from "../shadcn/skeleton";
import { ChatConversationItem } from "./ChatConversationItem";

interface ChatSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
}

export function ChatSidebar({
  activeSessionId,
  onSelectSession,
  onNewChat,
  className = "",
}: ChatSidebarProps) {
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  const { conversations, isLoading, isError } = useChatConversations();
  const { deleteConversation } = useDeleteChatConversation({
    onSuccess: () => {
      showSuccess("Başarılı", "Sohbet başarıyla silindi");
    },
    onError: () => {
      showError("Hata", "Sohbet silinirken bir hata oluştu");
    },
  });

  const handleDelete = (sessionId: string) => {
    // Eğer silinen sohbet aktif olan ise, yeni sohbete yönlendir
    if (sessionId === activeSessionId) {
      onNewChat();
    }
    deleteConversation(sessionId);
  };

  return (
    <div className={`flex h-full flex-col border-r bg-background ${className}`}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold tracking-tight">Sohbet Geçmişi</h2>
        <Button onClick={onNewChat} size="icon" variant="ghost" className="h-8 w-8">
          <MessageSquarePlus className="h-5 w-5" />
          <span className="sr-only">Yeni Sohbet</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pl-6">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Sohbet geçmişi yüklenemedi.
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground">Henüz sohbetiniz yok.</p>
            <Button
              onClick={onNewChat}
              variant="link"
              className="mt-2 text-primary"
            >
              Yeni bir sohbet başlat
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conv) => (
              <ChatConversationItem
                key={conv.session_id}
                conversation={conv}
                isActive={activeSessionId === conv.session_id}
                onClick={onSelectSession}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
