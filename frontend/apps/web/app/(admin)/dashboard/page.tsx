import { PageShell, ResponsiveSection } from "@repo/ui-web";

import { DashboardClient } from "./_components/DashboardClient";

export default function DashboardPage() {
  return (
    <PageShell>
      <ResponsiveSection className="pt-10 pb-20">
        <DashboardClient />
      </ResponsiveSection>
    </PageShell>
  );
}
