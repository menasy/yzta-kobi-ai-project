"use client";

import { MessageSquare, MoreVertical, Trash2 } from "lucide-react";

import type { ChatConversation } from "@repo/domain/chat";

import { Button } from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";

function formatRelativeDate(value: string | null): string {
  if (!value) {
    return "";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, "month");
  }

  const diffYears = Math.round(diffDays / 365);
  return rtf.format(diffYears, "year");
}

interface ChatConversationItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onClick: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function ChatConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: ChatConversationItemProps) {
  // Zaman gösterimi: Bugünse saat, eskiyse "X gün önce"
  const formattedDate = formatRelativeDate(conversation.last_message_at);

  return (
    <div
      onClick={() => onClick(conversation.session_id)}
      className={`group relative flex w-full cursor-pointer flex-col gap-1 rounded-xl p-3 text-left transition-all hover:bg-muted/80 ${
        isActive ? "bg-muted shadow-sm ring-1 ring-border/50" : "bg-transparent"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <MessageSquare
            className={`h-4 w-4 shrink-0 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="truncate text-sm font-medium text-foreground">
            {conversation.title || "Yeni Sohbet"}
          </span>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Seçenekler</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.session_id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sohbeti Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between gap-4 pl-6">
        <span className="line-clamp-1 flex-1 text-xs text-muted-foreground">
          {conversation.last_message_preview || "Henüz mesaj yok"}
        </span>
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground/60">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
