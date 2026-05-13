import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı | KOBİ AI",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Sayfa Bulunamadı
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  );
}
