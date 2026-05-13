import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { ChatLayoutClient } from "./components/ChatLayoutClient";

export const metadata: Metadata = {
  title: "AI Destek | KOBİ AI",
  description: "Akıllı asistanımız ile sorularınızı yanıtlayın",
};

export default function ChatPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col p-0 sm:p-0 relative overflow-hidden rounded-2xl border border-border/50 shadow-sm">
        <ChatLayoutClient />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
