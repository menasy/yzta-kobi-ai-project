import { GlobalFooter } from "@/components/navigation/GlobalFooter";
import { GlobalHeader } from "@/components/navigation/GlobalHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GlobalHeader />

      <main className="flex-1">{children}</main>

      <GlobalFooter />
    </div>
  );
}
