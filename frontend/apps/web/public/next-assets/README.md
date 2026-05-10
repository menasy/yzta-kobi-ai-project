# KobiAi Next.js Assets

Bu klasörü Next.js projenizde `apps/web/public/next-assets` altına kopyalayabilirsiniz.

Önerilen kullanım:

```tsx
// Header / Footer logo
<img src="/next-assets/logo-header.svg" alt="KobiAi" />

// Koyu footer/header için
<img src="/next-assets/logo-dark.svg" alt="KobiAi" />
```

Next.js `metadata` örneği:

```ts
export const metadata = {
  title: "KobiAi",
  icons: {
    icon: [
      { url: "/next-assets/logo-favicon.ico" },
      { url: "/next-assets/logo-favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/next-assets/logo-favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/next-assets/logo-apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/next-assets/site.webmanifest",
  openGraph: {
    images: [{ url: "/next-assets/logo-opengraph-image.png", width: 1200, height: 630 }],
  },
};
```

Not: SVG dosyaları, mevcut raster logonun taşınabilir SVG wrapper halidir. Tam editable/vector SVG için logo ayrıca vektörel olarak çizilmelidir.
