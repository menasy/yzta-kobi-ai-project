import { Logo } from "@/components/brand/logo";

// Minimal public layout — header ve footer bileşenleri sonraki adımda eklenecek
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo priority />
          <nav className="flex items-center gap-1">
            <a
              href="/chat"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              AI Asistan
            </a>
            <a
              href="/auth/login"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Giriş Yap
            </a>
          </nav>
        </div>
      </header>

      {/* İçerik */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:items-center">
          <Logo variant="footer" className="sm:shrink-0" />
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} KobiAi · Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
