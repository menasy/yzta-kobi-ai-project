import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOBİ AI — Ana Sayfa",
  description:
    "Sipariş sorgulama, kargo takibi ve stok kontrolü için yapay zeka destekli asistan.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-3xl text-center">
        {/* Hero Bölümü */}

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          KOBİ{" "}
          <span className="text-primary">AI Agent</span>
        </h1>

        <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
          Siparişlerinizi takip edin, stoklarınızı yönetin ve kargo durumunu
          anlık izleyin. Yapay zeka ile operasyonlarınızı otomatize edin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/chat"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            AI Asistan ile Konuş
          </a>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Yönetici Girişi
          </a>
        </div>

        {/* Özellik Kartları */}
        <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            {
              title: "Sipariş Takibi",
              description: "Tüm siparişlerinizi tek ekrandan anlık takip edin.",
              icon: "📦",
            },
            {
              title: "Stok Yönetimi",
              description: "Kritik stok uyarıları ve otomatik öneri sistemi.",
              icon: "📊",
            },
            {
              title: "Kargo Durumu",
              description: "Geciken kargolar için anlık bildirim ve raporlama.",
              icon: "🚚",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-5 text-card-foreground"
            >
              <div className="mb-3 text-2xl">{feature.icon}</div>
              <h2 className="mb-1 text-base font-semibold">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
