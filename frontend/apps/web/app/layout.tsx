import { MessageContainer } from "@repo/ui-web";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { isJwtExpired } from "@repo/domain/auth/utils/jwt";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "KobiAi",
  description:
    "KOBİ'ler için yapay zeka destekli operasyon ve iş yönetimi platformu.",
  icons: {
    icon: [
      { url: "/next-assets/logo-favicon.ico" },
      {
        url: "/next-assets/logo-favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/next-assets/logo-favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/next-assets/logo-favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/next-assets/logo-apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/next-assets/logo-favicon.ico"],
  },
  manifest: "/next-assets/site.webmanifest",
  openGraph: {
    title: "KobiAi",
    description:
      "KOBİ'ler için yapay zeka destekli operasyon ve iş yönetimi platformu.",
    images: [
      {
        url: "/next-assets/logo-opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "KobiAi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KobiAi",
    description:
      "KOBİ'ler için yapay zeka destekli operasyon ve iş yönetimi platformu.",
    images: ["/next-assets/logo-opengraph-image.png"],
  },
  other: {
    "msapplication-config": "/next-assets/browserconfig.xml",
  },
};

export const viewport = {
  themeColor: "#0F766E",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? null;
  const hasAuthCookie = Boolean(accessToken) && !isJwtExpired(accessToken);

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers
          hasAuthCookie={hasAuthCookie}
          authInitialState={{
            isAuthenticated: hasAuthCookie,
            isSessionLoading: hasAuthCookie,
          }}
        >
          {children}
          <MessageContainer position="top-right" />
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
