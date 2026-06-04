import { GlobalAiAssistant } from "@/components/ai-assistant/GlobalAiAssistant";
import { ResponsiveLayoutContainer } from "@/components/layout/ResponsiveLayoutContainer";
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
    <ResponsiveLayoutContainer>
      <GlobalHeader />

      <main className="flex-1">
        {children}
      </main>

      <GlobalFooter />
      <GlobalAiAssistant />
    </ResponsiveLayoutContainer>
  );
}
