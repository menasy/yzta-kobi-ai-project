import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | KOBİ AI",
    default: "KOBİ AI — Yapay Zeka Destekli Operasyon Platformu",
  },
  description:
    "KOBİ'ler için sipariş, stok ve kargo yönetimini yapay zeka ile otomatize eden platform.",
  keywords: ["kobi", "yapay zeka", "sipariş yönetimi", "stok takibi", "ai agent"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
