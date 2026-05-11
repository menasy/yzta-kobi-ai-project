import { Logo } from "@repo/ui";

export function GlobalFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:items-center">
        <Logo variant="footer" className="sm:shrink-0" />
        <p className="text-center text-xs text-muted-foreground sm:text-right">
          © {new Date().getFullYear()} KobiAi · Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
