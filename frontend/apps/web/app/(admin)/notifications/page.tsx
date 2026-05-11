import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { NotificationsPageClient } from "./_components/NotificationsPageClient";

export const metadata: Metadata = {
  title: "Bildirimler | KOBİ AI",
  description: "Sistem ve operasyon bildirimleri.",
};

export default function NotificationsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <NotificationsPageClient />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
