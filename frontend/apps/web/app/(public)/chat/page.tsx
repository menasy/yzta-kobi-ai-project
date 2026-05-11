import type { Metadata } from "next";
import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";

export const metadata: Metadata = {
  title: "AI Destek | KOBİ AI",
  description: "Akıllı asistanımız ile sorularınızı yanıtlayın",
};

export default function ChatPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight opacity-20">TODO</h1>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
