import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo package'larını transpile et
  transpilePackages: [
    "@repo/core",
    "@repo/domain",
    "@repo/state",
    "@repo/theme",
    "@repo/ui-contracts",
    "@repo/ui-web",
  ],

  // Görüntü optimizasyonu için izin verilen domain'ler
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Strict mode
  reactStrictMode: true,

  // Production'da console.log'ları kaldır
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Dev Indicator / DevTools ayarları
  devIndicators:
    process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true" ||
    (process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS !== "false" &&
      process.env.NODE_ENV === "development")
      ? {
          appIsrStatus: true,
          buildActivity: true,
        }
      : false,
};

export default nextConfig;
