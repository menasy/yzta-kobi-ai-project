"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";

import { ChatSidebar, ChatWindow } from "@repo/ui-web";
import { Button } from "@repo/ui-web/components/shadcn/button";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui-web/components/shadcn/sheet";

function normalizeSessionId(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || normalized === "[object Object]") {
    return null;
  }

  return normalized;
}

export function ChatLayoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Read the active session from the URL query parameter `s`
  const activeSessionId = normalizeSessionId(searchParams.get("s"));

  const handleSelectSession = (sessionId: string) => {
    const nextSessionId = normalizeSessionId(sessionId);
    if (!nextSessionId || nextSessionId === activeSessionId) {
      setIsSidebarOpen(false);
      return;
    }

    setIsSidebarOpen(false); // Close mobile sidebar if open
    router.push(`/chat?s=${encodeURIComponent(nextSessionId)}`);
  };

  const handleNewChat = (newSessionId?: string) => {
    setIsSidebarOpen(false);
    const nextSessionId = normalizeSessionId(newSessionId ?? null);
    if (nextSessionId) {
      if (nextSessionId === activeSessionId) {
        return;
      }
      router.push(`/chat?s=${encodeURIComponent(nextSessionId)}`);
    } else {
      if (!activeSessionId) {
        return;
      }
      router.push(`/chat`);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden w-80 shrink-0 md:block">
        <ChatSidebar
          activeSessionId={activeSessionId}
          onSelectSession={(id) => handleSelectSession(id)}
          onNewChat={() => handleNewChat()}
        />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <ChatSidebar
            activeSessionId={activeSessionId}
            onSelectSession={(id) => handleSelectSession(id)}
            onNewChat={() => handleNewChat()}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        {/* Mobile Header (only visible on small screens) */}
        <div className="md:hidden flex shrink-0 items-center border-b p-4 absolute top-0 left-0 w-full z-10 bg-background/80 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menüyü Aç</span>
          </Button>
          <span className="ml-3 font-semibold">Sohbet</span>
        </div>

        {/* Adjust top padding on mobile to account for the absolute header */}
        <div className="flex-1 overflow-hidden pt-16 md:pt-0">
          <ChatWindow
            sessionId={activeSessionId}
            onNewChat={handleNewChat}
          />
        </div>
      </div>
    </div>
  );
}
