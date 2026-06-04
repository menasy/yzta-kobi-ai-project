import { GlobalAiAssistant } from "@/components/ai-assistant/GlobalAiAssistant";
import { ResponsiveLayoutContainer } from "@/components/layout/ResponsiveLayoutContainer";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";
import { GlobalHeader } from "@/components/navigation/GlobalHeader";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveLayoutContainer>
      <GlobalHeader />

      <main className="flex-1">{children}</main>

      <GlobalFooter />
      <GlobalAiAssistant />
    </ResponsiveLayoutContainer>
  );
}
