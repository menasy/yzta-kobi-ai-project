import { PageShell } from "@repo/ui-web";
import { ResponsiveContainer } from "@repo/ui-web";

export default function ProductsPage() {
  return (
    <PageShell>
      <ResponsiveContainer className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Ürünler
          </h1>
          <p className="text-xl text-muted-foreground">
            Bu sayfa henüz yapım aşamasındadır.
          </p>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            TODO: Ürün listeleme ve yönetim paneli
          </div>
        </div>
      </ResponsiveContainer>
    </PageShell>
  );
}
