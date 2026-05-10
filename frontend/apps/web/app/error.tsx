"use client";

/**
 * Global Error Boundary — "use client" direktifi zorunludur.
 * Next.js App Router'ın error.tsx dosyası Client Component olmalıdır.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-8 max-w-md w-full">
        <p className="text-4xl font-bold text-destructive">!</p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Bir Hata Oluştu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message ?? "Beklenmedik bir hata meydana geldi."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Hata kodu: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
