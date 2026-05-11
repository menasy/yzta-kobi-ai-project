import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { DailyOrderSummaryWidget } from "./_components/DailyOrderSummaryWidget";

export const metadata: Metadata = {
  title: "Dashboard | KOBİ AI",
  description: "Yönetici paneli özeti",
};

export default function DashboardPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DailyOrderSummaryWidget />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
