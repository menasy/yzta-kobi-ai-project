import { Logo } from "@repo/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Asistan | KOBİ AI",
  description:
    "Sipariş durumu, stok ve kargo bilgisi için yapay zeka asistanıyla konuşun.",
};

/**
 * Chat sayfası — SSR shell.
 * Mesaj akışı ve input mantığı Client Component'e devredilecek.
 * Şu an build kırmamak için minimal placeholder.
 */
export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Logo variant="icon" className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">KOBİ AI Asistan</p>
              <p className="text-xs text-muted-foreground">Sipariş, stok ve kargo soruları için hazır</p>
            </div>
          </div>
          <div className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
      </header>

      {/* Mesaj Alanı — Chat Client Component buraya mount edilecek */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Hoş geldin mesajı */}
          <div className="flex justify-start">
            <div className="max-w-xs rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-foreground lg:max-w-md">
              <p>Merhaba! Size nasıl yardımcı olabilirim?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sipariş durumu, stok bilgisi veya kargo takibi sorabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Input Alanı */}
      <footer className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled
            />
            <button
              type="button"
              disabled
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground opacity-50"
            >
              Gönder
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            Chat bileşeni yakında aktif olacak.
          </p>
        </div>
      </footer>
    </div>
  );
}
