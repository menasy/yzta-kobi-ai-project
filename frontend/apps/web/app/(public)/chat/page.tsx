import type { Metadata } from "next";
import { ResponsiveContainer, ResponsiveSection, ChatWindow } from "@repo/ui-web";

export const metadata: Metadata = {
  title: "AI Destek | KOBİ AI",
  description: "Akıllı asistanımız ile sorularınızı yanıtlayın",
};

export default function ChatPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col p-0 sm:p-0 relative overflow-hidden rounded-2xl border border-border/50 shadow-sm">
        <ChatWindow />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
