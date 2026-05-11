import {
  ResponsiveContainer,
  ResponsiveSection,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InventoryTable,
  LowStockAlerts,
} from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stok Yönetimi | KOBİ AI",
  description: "Envanter ve stok durumu takibi",
};

export default function InventoryPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Stok Yönetimi</h1>
          <p className="text-muted-foreground">
            Tüm ürünlerinizin stok durumunu, kritik stok seviyelerini buradan takip edebilir ve güncelleyebilirsiniz.
          </p>
        </div>

        <LowStockAlerts />

        <Card>
          <CardHeader>
            <CardTitle>Stok Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTable />
          </CardContent>
        </Card>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
