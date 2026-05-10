import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | KOBİ AI",
  description: "Sipariş, stok ve kargo özeti — yönetici paneli",
};

/**
 * Admin Dashboard — SSR shell.
 * Veri çekme ve TanStack Query entegrasyonu sonraki adımda eklenecek.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Operasyonlarınızın anlık özeti
        </p>
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Toplam Sipariş",   value: "—", icon: "📦", change: "" },
          { label: "Bekleyen",         value: "—", icon: "⏳", change: "" },
          { label: "Kargoda",          value: "—", icon: "🚚", change: "" },
          { label: "Günlük Ciro",      value: "—", icon: "💰", change: "" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5 text-card-foreground"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
            {stat.change && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Grafik ve Tablo placeholder */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Son 7 Günlük Siparişler
          </h2>
          <div className="flex h-48 items-center justify-center rounded-md bg-muted">
            <p className="text-sm text-muted-foreground">
              Grafik yükleniyor...
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Kritik Stok Uyarıları
          </h2>
          <div className="flex h-48 items-center justify-center rounded-md bg-muted">
            <p className="text-sm text-muted-foreground">
              Stok verileri yükleniyor...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
