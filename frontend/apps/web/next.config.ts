import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo package'larını transpile et
  transpilePackages: [
    "@repo/core",
    "@repo/domain",
    "@repo/state",
    "@repo/theme",
    "@repo/ui",
    "@repo/i18n",
    "@repo/ui-contracts",
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
};

export default nextConfig;
