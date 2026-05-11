import { GlobalFooter } from "@/components/navigation/GlobalFooter";
import { GlobalHeader } from "@/components/navigation/GlobalHeader";

/**
 * Admin Layout - Yan menü (sidebar) tamamen kaldırıldı.
 * Tüm sayfalar artık global header, responsive içerik alanı ve footer'ı kullanıyor.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GlobalHeader />

      <main className="flex-1">
        {children}
      </main>

      <GlobalFooter />
    </div>
  );
}
