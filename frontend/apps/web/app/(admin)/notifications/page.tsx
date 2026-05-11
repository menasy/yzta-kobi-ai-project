import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bildirimler | KOBİ AI",
  description: "Sistem ve operasyon bildirimleri.",
};

export default function NotificationsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight opacity-20">Bildirimler TODO</h1>
          <p className="mt-4 text-muted-foreground">Yönetici bildirim merkezi yakında burada olacak.</p>
        </div>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
