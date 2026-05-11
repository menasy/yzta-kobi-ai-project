# KOBİ AI Agent — Frontend Mimari & Geliştirme Planı

> Bu döküman hem geliştirici yol haritası hem de AI geliştirme ajanı için referans kaynaktır.
> Backend planıyla tam uyumlu tasarlanmıştır. Her karar gerekçelidir.
> SOLID, DRY, Clean Architecture ve Colocation prensipleri esas alınmıştır.

---

## İçindekiler

1. [Proje Vizyonu ve Kapsam](#1-proje-vizyonu-ve-kapsam)
2. [Teknoloji Seçimleri ve Gerekçeleri](#2-teknoloji-seçimleri-ve-gerekçeleri)
3. [Monorepo Mimarisi](#3-monorepo-mimarisi)
4. [Tam Proje Ağacı](#4-tam-proje-ağacı)
5. [Semantic Tema Sistemi](#5-semantic-tema-sistemi)
6. [Package Görev Tanımları](#6-package-görev-tanımları)
7. [Uygulama Yapısı — Sayfalar ve Routing](#7-uygulama-yapısı--sayfalar-ve-routing)
8. [State Management Stratejisi](#8-state-management-stratejisi)
9. [API Entegrasyon Katmanı](#9-api-entegrasyon-katmanı)
10. [Component Mimarisi](#10-component-mimarisi)
11. [SSR / CSR Hibrit Strateji](#11-ssr--csr-hibrit-strateji)
12. [i18n — Çoklu Dil Desteği](#12-i18n--çoklu-dil-desteği)
13. [Geliştirme Yol Haritası — Gün Gün](#13-geliştirme-yol-haritası--gün-gün)
14. [Geliştirme Kuralları](#14-geliştirme-kuralları)

---

## 1. Proje Vizyonu ve Kapsam

### Hackathon Demo Önceliği
Projenin hızlıca test edilebilir bir MVP'ye ulaşması için aşağıdaki öncelik sıralaması belirlenmiştir:

**P0 — Müşteri İletişiminin Otomasyonu**
- Doğal dil üzerinden AI chat deneyimi.
- Müşteri "128 numaralı siparişim ne zaman gelir?" dediğinde sistem siparişi ve gerekiyorsa kargo durumunu sorgulayıp yanıt verir.
- Frontend’de chat ekranı demo için en kritik akıştır.

**P0 — Ürün ve Sipariş Takibi**
- Yönetici dashboard’unda sipariş özeti, bekleyen siparişler, ürün/stok durumu görünür.
- Sipariş listesi ve sipariş detayı demo için tamamlanmalıdır.

**P1 — Stok ve Envanter Yönetimi**
- Kritik stok uyarıları görünür olmalı.
- Stok seviyesi düşük ürünler için öneri/uyarı UI’ı hazırlanmalı.
- Replenishment suggestion varsa frontend bunu ayrı bir kart/banner olarak göstermeli.

**P1/P2 — Kargo Süreçlerinin Yönetimi**
- Kargo durumu ve gecikme tespiti en son önceliktir.
- Geciken kargo varsa yöneticiye görünür rapor/kart olarak gösterilir.
- Demo yetişirse dahil edilir, temel akışları bozacak şekilde öne alınmaz.

---

### Frontend'in Rolü

Backend, yapay zeka destekli bir operasyon merkezi sunar. Frontend bu merkezin iki farklı yüzüdür:

- **Müşteri Arayüzü:** Sipariş sorgulama, kargo takibi ve stok kontrolü için doğal dil üzerinden AI chat deneyimi.
- **Yönetici Arayüzü:** Siparişler, stok, kargo ve günlük operasyonun tek ekrandan izlendiği SSR-ağırlıklı admin paneli.

### Ekranlar ve Öncelikler

| Ekran | Kullanıcı | Rendering | Öncelik |
|-------|-----------|-----------|---------|
| Landing / Ana Sayfa | Herkese açık | SSR | P0 |
| Chat (AI Asistan) | Herkese açık | SSR shell + CSR | P0 |
| Ürünler Listesi | Herkese açık | SSR | P0 |
| Ürün Detayı | Herkese açık | SSR | P0 |
| Siparişlerim (Müşteri) | Müşteri | SSR | P0 |
| Admin Dashboard | Yönetici | SSR + polling | P0 |
| Siparişler (Yönetici) | Yönetici | SSR | P0 |
| Ürün Yönetimi (Admin) | Yönetici | SSR | P1 |
| Stok / Envanter | Yönetici | SSR + live alerts | P1 |
| Kargo Takibi | Yönetici | SSR | P1 |
| Bildirimler | Yönetici | SSR | P1 |
| Login / Register | Auth | CSR | P0 |

---

## 2. Teknoloji Seçimleri ve Gerekçeleri

### Workspace & Build

| Teknoloji | Sürüm | Rol | Neden |
|-----------|-------|-----|-------|
| **pnpm** | 9.0.0+ | Paket yöneticisi | Tek lockfile, workspace bağımlılık çözümü, disk tasarrufu |
| **Turborepo** | ^2.8.9 | Build orchestration | Pipeline tanımları, remote cache, paralel build |
| **TypeScript** | 5.9.x | Tip güvenliği | Tüm repo — strict mode, path aliases, package exports |

### Framework & Runtime

| Teknoloji | Sürüm | Rol | Neden |
|-----------|-------|-----|-------|
| **Next.js** | 15.x | App Router, SSR/CSR hibrit | App Router ile RSC, Server Actions, layout nesting |
| **React** | ^19.x | UI runtime | Concurrent features, Server Components |

**Neden App Router:** Page Router'a kıyasla layout paylaşımı, RSC (React Server Components), Server Actions ve streaming desteği sunar. Admin paneli gibi data-heavy sayfalarda sunucu taraflı veri çekimi daha performanslıdır.

### UI & Stil

| Teknoloji | Sürüm | Rol | Neden |
|-----------|-------|-----|-------|
| **Tailwind CSS** | 3.x | Utility CSS | Token tabanlı semantik tema ile mükemmel uyum |
| **shadcn/ui** | latest | Hazır component kütüphanesi | Radix UI tabanlı, erişilebilir, kopyala-yapıştır felsefesi |
| **Radix UI** | — | Unstyled primitives | shadcn altyapısı — accessibility built-in |
| **Geist** | ^1.7.0 | Web font | Vercel'in tasarım fontu, Next.js ile native entegrasyon |
| **Lucide React** | latest | İkon kütüphanesi | shadcn'in default ikon seti, tree-shakeable |
| **next-themes** | latest | Tema yönetimi | SSR-safe dark/light mode, CSS variable entegrasyonu |
| **Framer Motion** | latest | Animasyon | Chat mesajları, sayfa geçişleri, stagger efektleri |

### State Management

| Teknoloji | Sürüm | Rol | Neden |
|-----------|-------|-----|-------|
| **Zustand** | ^5.0.x | Client state | Kullanıcı bilgisi, chat session, UI durumu (sidebar, loading) |
| **TanStack Query** | ^5.90.x | Server state | Cache, polling, optimistic updates, stale-while-revalidate |

**Kural:** Server state (API verisi) → TanStack Query. Client state (UI durumu, session) → Zustand. İkisi karıştırılmaz.

### Veri ve Formlar

| Teknoloji | Sürüm | Rol | Neden |
|-----------|-------|-----|-------|
| **Zod** | ^4.x | Schema validation | Tip-safe form validasyonu, API response doğrulaması |
| **React Hook Form** | ^7.71.x | Form state | Performanslı, Zod entegrasyonu (`zodResolver`) |
| **TanStack Table** | ^8.x | Tablo yönetimi | Sipariş ve ürün listeleri için sorting, filtering, pagination |
| **TanStack Virtual** | ^3.x | Virtualization | Uzun listelerde performans |
| **date-fns** | ^4.x | Tarih formatlama | Sipariş tarihleri, kargo tahmini — tree-shakeable |
| **nuqs** | ^2.x | URL state | Filtre, sayfalama, arama parametrelerini URL'de tut |

### Bildirim & UX

| Teknoloji | Sürüm | Rol | Neden |
|-----------|-------|-----|-------|
| **Sonner** | latest | Toast bildirimleri | shadcn ekosistemiyle uyumlu, SSR-safe |
| **Recharts** | ^2.x | Dashboard grafikleri | React-native, responsive, accessible |

**Ek öneri:** `cmdk` (command palette) — yönetici panelinde hızlı navigasyon için shadcn'in `Command` komponenti üzerinden gelir, ek kurulum gerekmez.

---

## 3. Monorepo Mimarisi

### Yapı Felsefesi

Monorepo, `apps/` ve `packages/` olmak üzere iki ana katmandan oluşur.

```
apps/        → Çalışan uygulamalar (deployable)
packages/    → Paylaşılan iş katmanı ve altyapı
```

**Bağımlılık akışı (tek yönlü, ihlal edilemez):**

```
apps/web
  → packages/ui
  → packages/domain
      → packages/core
          → (dış kütüphaneler)
  → packages/state
  → packages/i18n
  → packages/theme
  → packages/ui-contracts
```

`packages/core` hiçbir iç package'ı import etmez. `packages/domain`, `core`'u import edebilir ama `ui`'ı import edemez. Bu kural bağımlılık döngüsünü ve spaghetti code'u önler.

### `turbo.json` — Pipeline Tanımı

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 4. Tam Proje Ağacı

```
kobi-agent/
│
├── apps/
│   └── web/                                    # Next.js 15 — tek web uygulaması
│       │
│       ├── app/                                # App Router root
│       │   ├── layout.tsx                      # Root layout
│       │   ├── globals.css                     # CSS değişkenleri
│       │   ├── not-found.tsx                   # Global 404
│       │   ├── error.tsx                       # Global error
│       │   │
│       │   ├── (public)/                       # Public/Storefront group
│       │   │   ├── layout.tsx                  # Public layout: header + footer
│       │   │   ├── page.tsx                    # Landing page
│       │   │   ├── chat/
│       │   │   │   └── page.tsx                # AI Asistan (Public)
│       │   │   └── products/
│       │   │       ├── page.tsx                # Ürün listesi (Public)
│       │   │       └── [id]/
│       │   │           └── page.tsx            # Ürün detayı (Public)
│       │   │
│       │   ├── (admin)/                        # Admin/Protected group
│       │   │   ├── layout.tsx                  # Admin layout
│       │   │   ├── dashboard/
│       │   │   │   ├── page.tsx                # Ana dashboard
│       │   │   │   └── products/
│       │   │   │       └── page.tsx            # Ürün yönetimi (Admin)
│       │   │   ├── orders/
│       │   │   │   ├── page.tsx                # Tüm siparişler (Admin)
│       │   │   │   ├── [id]/
│       │   │   │   │   └── page.tsx            # Sipariş detay yönetimi (Admin)
│       │   │   │   └── my/
│       │   │   │       └── page.tsx            # Siparişlerim (Customer)
│       │   │   ├── inventory/
│       │   │   │   └── page.tsx                # Stok yönetimi
│       │   │   ├── shipments/
│       │   │   │   └── page.tsx                # Kargo yönetimi
│       │   │   └── notifications/
│       │   │       └── page.tsx            # Bildirim merkezi
│       │   │
│       │   └── auth/                           # Auth group
│       │       ├── layout.tsx                  # Auth layout: header + footer
│       │       ├── login/
│       │       │   └── page.tsx                # Login formu
│       │       └── register/
│       │           └── page.tsx                # Register formu
│       │
│       │
│       ├── components/                         # App-specific — paylaşılmaz
│       │   ├── providers/
│       │   │   ├── index.tsx                   # Tüm provider'ları sarar (composition)
│       │   │   ├── query-provider.tsx          # TanStack QueryClientProvider
│       │   │   └── theme-provider.tsx          # next-themes ThemeProvider
│       │   │
│       │   └── navigation/
│       │       ├── admin-sidebar.tsx           # Admin sol nav
│       │       │                               # Zustand ile collapsed/expanded state
│       │       │                               # Active route highlight
│       │       ├── admin-header.tsx            # Admin üst bar
│       │       │                               # Breadcrumb, kullanıcı dropdown
│       │       │                               # Tema toggle, dil seçici
│       │       └── public-header.tsx           # Public sayfa header'ı
│       │
│       ├── lib/
│       │   └── auth.ts                         # Middleware yardımcıları
│       │                                       # Cookie yardımcıları
│       │                                       # Cookie okuma
│       │
│       ├── middleware.ts                        # Next.js route middleware
│       │                                       # Cookie varlık kontrolü
│       │                                       # (admin)/* → cookie yoksa /auth/login
│       │                                       # /auth/* → cookie varsa /dashboard
│       │
│       ├── next.config.ts                      # Next.js konfigürasyonu
│       │                                       # Package transpile listesi
│       │                                       # Image domains
│       │
│       ├── tailwind.config.ts                  # Tailwind konfigürasyonu
│       │                                       # packages/theme'den token import
│       │                                       # CSS variable referansları
│       │                                       # shadcn plugin
│       │
│       ├── postcss.config.mjs
│       ├── tsconfig.json                        # @repo/* path alias'ları
│       └── package.json
│
└── packages/
    │
    ├── core/                                   # Altyapı — dışa sıfır bağımlılık
    │   │                                       # Herkes bu package'ı import edebilir
    │   │                                       # Bu package hiçbir iç package'ı import etmez
    │   │
    │   ├── client/
    │   │   ├── client.ts                       # Temel HTTP istemcisi
    │   │   │                                   # fetch wrapper (async/await)
    │   │   │                                   # Base URL yapılandırması
    │   │   │                                   # Default headers
    │   │   │
    │   │   ├── interceptors.ts                 # İstek/yanıt interceptor'ları
    │   │   │                                   # credentials: "include" ayarı
    │   │   │                                   # 401 → logout redirect
    │   │   │
    │   │   ├── response-handler.ts             # ApiResponse<T> unwrapper
    │   │   │                                   # Backend standart response formatını parse eder
    │   │   │                                   # { statusCode, key, message, data, errors }
    │   │   │
    │   │   ├── api-error.ts                    # ApiError sınıfı
    │   │   │                                   # key, message, errors, statusCode
    │   │   │
    │   │   └── types.ts                        # ApiResponse<T>, PaginatedData<T>,
    │   │                                       # ApiError tipler
    │   │
    │   ├── hooks/
    │   │   ├── useDebounce.ts                  # Input araması için debounce hook
    │   │   └── useIntersectionObserver.ts      # Lazy load, infinite scroll için
    │   │
    │   ├── utils/
    │   │   ├── cn.ts                           # clsx + tailwind-merge → cn() helper
    │   │   ├── format.ts                       # Para, tarih, telefon formatları
    │   │   └── pagination.ts                   # Sayfalama hesaplama yardımcıları
    │   │
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── domain/                                 # İş alanı katmanı
    │   │                                       # API çağrıları, TanStack Query hook'ları,
    │   │                                       # Zod şemaları, TS tipleri
    │   │
    │   ├── auth/
    │   │   ├── api/
    │   │   │   └── auth.api.ts                 # login(), register(), getMe()
    │   │   ├── hooks/
    │   │   │   ├── useLogin.ts                 # useMutation → POST /api/auth/login
    │   │   │   ├── useRegister.ts              # useMutation → POST /api/auth/register
    │   │   │   └── useMe.ts                    # useQuery → GET /api/auth/me
    │   │   ├── schemas/
    │   │   │   └── auth.schema.ts              # Zod: LoginSchema, RegisterSchema
    │   │   ├── types/
    │   │   │   └── auth.types.ts               # User, LoginRequest
    │   │   └── index.ts
    │   │
    │   ├── chat/
    │   │   ├── api/
    │   │   │   └── chat.api.ts                 # sendMessage(), getHistory(), clearHistory()
    │   │   ├── hooks/
    │   │   │   ├── useSendMessage.ts           # useMutation → POST /api/chat/message
    │   │   │   └── useChatHistory.ts           # useQuery → GET /api/chat/history/{id}
    │   │   ├── types/
    │   │   │   └── chat.types.ts               # ChatMessage, ChatResponse, MessageRole
    │   │   └── index.ts
    │   │
    │   ├── orders/
    │   │   ├── api/
    │   │   │   └── orders.api.ts               # getOrders(), getOrder(), createOrder(),
    │   │   │                                   # updateStatus(), getDailySummary()
    │   │   ├── hooks/
    │   │   │   ├── useOrders.ts                # useQuery → GET /api/orders (paginated)
    │   │   │   ├── useOrder.ts                 # useQuery → GET /api/orders/{id}
    │   │   │   ├── useCreateOrder.ts           # useMutation → POST /api/orders
    │   │   │   ├── useUpdateOrderStatus.ts     # useMutation → PUT /api/orders/{id}/status
    │   │   │   └── useDailySummary.ts          # useQuery + polling → GET /api/orders/summary/today
    │   │   ├── schemas/
    │   │   │   └── order.schema.ts             # Zod: CreateOrderSchema
    │   │   ├── types/
    │   │   │   └── orders.types.ts             # Order, OrderItem, OrderStatus, OrderSummary
    │   │   └── index.ts
    │   │
    │   ├── products/
    │   │   ├── api/
    │   │   │   └── products.api.ts             # getProducts(), getProduct(),
    │   │   │                                   # createProduct(), updateProduct()
    │   │   ├── hooks/
    │   │   │   ├── useProducts.ts              # useQuery → GET /api/products
    │   │   │   ├── useProduct.ts               # useQuery → GET /api/products/{id}
    │   │   │   ├── useCreateProduct.ts         # useMutation
    │   │   │   └── useUpdateProduct.ts         # useMutation
    │   │   ├── schemas/
    │   │   │   └── product.schema.ts           # Zod: CreateProductSchema
    │   │   ├── types/
    │   │   │   └── products.types.ts           # Product, ProductWithStock
    │   │   └── index.ts
    │   │
    │   ├── inventory/
    │   │   ├── api/
    │   │   │   └── inventory.api.ts            # getInventory(), getLowStock(),
    │   │   │                                   # updateStock(), getStockReport()
    │   │   ├── hooks/
    │   │   │   ├── useInventory.ts             # useQuery → GET /api/inventory (60sn polling)
    │   │   │   ├── useLowStock.ts              # useQuery → GET /api/inventory/low-stock
    │   │   │   └── useUpdateStock.ts           # useMutation → PUT /api/inventory/stock
    │   │   ├── types/
    │   │   │   └── inventory.types.ts          # InventoryItem, LowStockAlert, StockReport
    │   │   └── index.ts
    │   │
    │   ├── shipments/
    │   │   ├── api/
    │   │   │   └── shipments.api.ts            # getShipments(), getShipment(),
    │   │   │                                   # refreshShipment(), getDelayed()
    │   │   ├── hooks/
    │   │   │   ├── useShipments.ts             # useQuery → GET /api/shipments
    │   │   │   ├── useDelayedShipments.ts      # useQuery → GET /api/shipments/delayed
    │   │   │   └── useRefreshShipment.ts       # useMutation → POST /api/shipments/{id}/refresh
    │   │   ├── types/
    │   │   │   └── shipments.types.ts          # Shipment, ShipmentStatus, Carrier
    │   │   └── index.ts
    │   │
    │   ├── clients/                            # Ortak API İstemci (Client) Tanımları
    │   │   │                                   # Ortama göre (Client/Server) URL yapılandırılır
    │   │   │                                   # Hem RSC hem de CSR (hooks) tarafından kullanılır
    │   │   │
    │   │   └── api-client.ts                   # Ortak ApiClient instance (NEXT_PUBLIC_API_BASE_URL)
    │   │
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── state/                                  # Global state yönetimi
    │   │
    │   ├── query/
    │   │   ├── client.ts                       # TanStack QueryClient instance
    │   │   │                                   # Default staleTime, retry, gcTime ayarları
    │   │   ├── provider.tsx                    # QueryClientProvider wrapper
    │   │   ├── keys.ts                         # Query key factory (type-safe)
    │   │   │                                   # queryKeys.orders.all()
    │   │   │                                   # queryKeys.orders.detail(id)
    │   │   └── types.ts
    │   │
    │   ├── stores/
    │   │   ├── auth/
    │   │   │   └── auth.store.ts               # Zustand: user, isLoading, logout
    │   │   │                                   # Sadece UI durumu, token JS'te tutulmaz
    │   │   ├── chat/
    │   │   │   └── chat.store.ts               # Zustand: sessionId, optimistic messages
    │   │   │                                   # addMessage(), setSessionId()
    │   │   ├── ui/
    │   │   │   └── ui.store.ts                 # Zustand: sidebarOpen, globalLoading
    │   │   └── theme/
    │   │       └── theme.store.ts              # Zustand: 'light' | 'dark' | 'system'
    │   │
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── theme/                                  # Semantic design token sistemi
    │   │                                       # Tek renk kaynağı — başka yerde renk yok
    │   │
    │   ├── tokens.ts                           # Ham renk paleti (HSL değerleri)
    │   ├── semantic.ts                         # Semantic token mapping (light/dark)
    │   ├── typography.ts                       # Font boyutları, ağırlıklar, satır aralıkları
    │   ├── spacing.ts                          # 4px tabanlı spacing scale
    │   ├── breakpoints.ts                      # sm, md, lg, xl, 2xl
    │   ├── shadows.ts                          # Shadow tanımları
    │   ├── radius.ts                           # Border radius scale
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── ui/                                     # Paylaşılan UI component kütüphanesi
    │   │
    │   ├── components/
    │   │   │
    │   │   ├── shadcn/                         # shadcn/ui component'leri (kurulmuş)
    │   │   │   ├── button.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── sheet.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── label.tsx
    │   │   │   ├── badge.tsx
    │   │   │   ├── table.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── separator.tsx
    │   │   │   ├── skeleton.tsx
    │   │   │   ├── tooltip.tsx
    │   │   │   ├── dropdown-menu.tsx
    │   │   │   ├── command.tsx
    │   │   │   ├── avatar.tsx
    │   │   │   ├── progress.tsx
    │   │   │   ├── scroll-area.tsx
    │   │   │   ├── popover.tsx
    │   │   │   ├── alert.tsx
    │   │   │   └── form.tsx                    # react-hook-form entegrasyonu
    │   │   │
    │   │   ├── chat/                           # Müşteri chat component'leri
    │   │   │   ├── ChatWindow.tsx              # Ana chat container
    │   │   │   ├── ChatMessage.tsx             # Tek mesaj balonu (user/agent)
    │   │   │   ├── ChatMessageList.tsx         # Mesaj listesi (scroll, animasyon)
    │   │   │   ├── ChatInput.tsx               # Mesaj giriş alanı + gönder
    │   │   │   └── TypingIndicator.tsx         # "Yanıt yazılıyor..." animasyonu
    │   │   │
    │   │   ├── dashboard/                      # Dashboard'a özgü component'ler
    │   │   │   ├── StatCard.tsx                # Sayı + ikon + trend kartı
    │   │   │   ├── OrderChart.tsx              # Recharts ile sipariş grafiği
    │   │   │   ├── RecentOrdersTable.tsx       # Son siparişler özet tablosu
    │   │   │   └── LowStockBanner.tsx          # Kritik stok uyarı banner'ı
    │   │   │
    │   │   ├── orders/                         # Sipariş component'leri
    │   │   │   ├── OrderTable.tsx              # TanStack Table implementasyonu
    │   │   │   ├── OrderStatusBadge.tsx        # Durum renk etiketleri
    │   │   │   ├── OrderStatusSelect.tsx       # Durum güncelleme dropdown'u
    │   │   │   └── OrderDetailCard.tsx         # Sipariş detay bilgi kartı
    │   │   │
    │   │   ├── inventory/                      # Stok component'leri
    │   │   │   ├── StockTable.tsx              # Stok listesi (inline edit)
    │   │   │   ├── StockLevelBar.tsx           # Yüzde dolu bar (eşik gösterimi)
    │   │   │   └── LowStockAlert.tsx           # Tek ürün için uyarı satırı
    │   │   │
    │   │   ├── shipments/                      # Kargo component'leri
    │   │   │   ├── ShipmentTable.tsx           # Kargo listesi
    │   │   │   ├── ShipmentStatusBadge.tsx     # in_transit / delayed / delivered
    │   │   │   └── RefreshButton.tsx           # Kargo durumu güncelle butonu
    │   │   │
    │   │   └── shared/                         # Tüm domain'lerde kullanılan
    │   │       ├── DataTable.tsx               # Generic TanStack Table wrapper
    │   │       ├── PageHeader.tsx              # Sayfa başlığı + breadcrumb
    │   │       ├── LoadingSpinner.tsx          # Yükleme göstergesi
    │   │       ├── Skeleton variants           # Sayfa-özel skeleton loading
    │   │       ├── EmptyState.tsx              # Boş liste durumu
    │   │       ├── ErrorState.tsx              # Hata durumu (retry butonu)
    │   │       └── ConfirmDialog.tsx           # Silme/güncelleme onay dialog'u
    │   │
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── i18n/                                   # Çoklu dil desteği
    │   ├── config/
    │   │   ├── index.ts                        # i18next konfigürasyonu
    │   │   └── languages.ts                    # Desteklenen diller: tr, en
    │   ├── locales/
    │   │   ├── tr/
    │   │   │   ├── common.json                 # Ortak: butonlar, mesajlar
    │   │   │   ├── auth.json                   # Giriş, kayıt ekranları
    │   │   │   ├── chat.json                   # Chat arayüzü
    │   │   │   ├── orders.json                 # Sipariş ekranları
    │   │   │   ├── products.json               # Ürün ekranları
    │   │   │   ├── inventory.json              # Stok ekranları
    │   │   │   └── shipments.json              # Kargo ekranları
    │   │   └── en/
    │   │       └── ... (tr ile aynı yapı)
    │   ├── utils/
    │   │   └── getTranslation.ts               # Server Component'ler için çeviri yardımcısı
    │   ├── types/
    │   │   └── index.ts                        # TypeScript i18n tipleri
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── ui-contracts/                           # Paylaşılan prop tip sözleşmeleri
    │   │                                       # packages/ui ve apps/web arasındaki köprü
    │   │                                       # Component prop'larının canonical tipi
    │   │
    │   ├── chat/
    │   │   └── chat.types.ts
    │   ├── dashboard/
    │   │   └── dashboard.types.ts
    │   ├── orders/
    │   │   └── order-table.types.ts
    │   ├── inventory/
    │   │   └── inventory.types.ts
    │   ├── shipments/
    │   │   └── shipment.types.ts
    │   ├── shared/
    │   │   ├── data-table.types.ts
    │   │   ├── page-header.types.ts
    │   │   └── stat-card.types.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── typescript-config/                      # Ortak TS konfigürasyonları
    │   ├── base.json                           # Tüm package'lar için base
    │   ├── nextjs.json                         # apps/web için Next.js özel ayarlar
    │   ├── react-library.json                  # UI package'ları için
    │   └── package.json
    │
    └── eslint-config/                          # Ortak ESLint kuralları
        ├── base.js
        ├── next.js
        ├── react-internal.js
        └── package.json
```

---

## 5. Semantic Tema Sistemi

### Felsefe

**Hiçbir component dosyasında hardcode renk bulunmaz.** `text-red-500`, `bg-blue-600`, `border-gray-200` gibi ifadeler yasaktır. Tüm renkler CSS değişkenleri üzerinden gelir ve bu değişkenler yalnızca iki yerde tanımlanır:

1. `packages/theme/` → Token tanımları (TypeScript)
2. `apps/web/globals.css` → CSS değişken bildirimleri (`:root` ve `.dark`)

---

### `packages/theme/tokens.ts` — Ham Palet

```typescript
// Ham renk paleti — HSL formatı
// Bu dosya sadece "ham ham" değerleri içerir, semantic anlam yoktur.

export const palette = {
  // Nötr tonlar
  neutral: {
    0:   "0 0% 100%",       // beyaz
    50:  "0 0% 98%",
    100: "0 0% 96%",
    200: "0 0% 90%",
    300: "0 0% 83%",
    400: "0 0% 64%",
    500: "0 0% 45%",
    600: "0 0% 32%",
    700: "0 0% 22%",
    800: "0 0% 15%",
    900: "0 0% 9%",
    950: "0 0% 4%",
    1000:"0 0% 0%",         // siyah
  },

  // Marka rengi — koyu yeşil-mavi tonu (KOBİ güveni)
  primary: {
    50:  "174 60% 95%",
    100: "174 58% 88%",
    200: "174 55% 75%",
    300: "174 50% 60%",
    400: "174 48% 46%",
    500: "174 46% 35%",     // ana marka rengi
    600: "174 48% 28%",
    700: "174 50% 22%",
    800: "174 52% 16%",
    900: "174 55% 10%",
  },

  // Başarı — yeşil
  success: {
    50:  "142 76% 95%",
    500: "142 71% 45%",
    700: "142 74% 30%",
  },

  // Uyarı — amber
  warning: {
    50:  "38 92% 95%",
    500: "38 92% 50%",
    700: "32 95% 35%",
  },

  // Hata — kırmızı
  destructive: {
    50:  "0 86% 97%",
    500: "0 72% 51%",
    700: "0 75% 38%",
  },
} as const;
```

---

### `packages/theme/semantic.ts` — Semantic Token Mapping

```typescript
// Semantic tokenlar — neyi temsil ettiğini isimlendiriyoruz.
// Bu dosya, globals.css'deki CSS değişkenlerinin TypeScript yansımasıdır.
// Her isim, CSS değişken adıyla 1:1 eşleşir.

export const semanticTokens = {
  light: {
    // Arkaplan katmanları
    background:        "var(--background)",          // sayfa arkaplanı
    backgroundMuted:   "var(--background-muted)",    // hafif kontrast alan
    backgroundCard:    "var(--card)",                // kart arkaplanı
    backgroundPopover: "var(--popover)",             // dropdown, tooltip

    // Metin
    foreground:        "var(--foreground)",           // ana metin
    foregroundMuted:   "var(--muted-foreground)",    // ikincil metin
    foregroundCard:    "var(--card-foreground)",

    // Marka (Primary)
    primary:           "var(--primary)",
    primaryForeground: "var(--primary-foreground)",  // primary üzerindeki metin

    // Durum renkleri
    success:           "var(--success)",
    successForeground: "var(--success-foreground)",
    warning:           "var(--warning)",
    warningForeground: "var(--warning-foreground)",
    destructive:       "var(--destructive)",
    destructiveForeground: "var(--destructive-foreground)",

    // Kenarlık
    border:            "var(--border)",
    input:             "var(--input)",
    ring:              "var(--ring)",

    // Grafik renkleri (Recharts)
    chart1:            "var(--chart-1)",
    chart2:            "var(--chart-2)",
    chart3:            "var(--chart-3)",
  },
  // dark tokenlar aynı yapı, CSS .dark sınıfıyla override edilir
} as const;
```

---

### `apps/web/globals.css` — CSS Değişken Bildirimleri

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/*
  TÜM RENKLER SADECE BURADAN GELİR.
  Hiçbir component, Tailwind'in renk skalasını (red-500, blue-600 vb.)
  doğrudan kullanamaz. Yalnızca aşağıdaki CSS değişkenleri kullanılır.
*/

@layer base {
  :root {
    --background:          0 0% 100%;
    --background-muted:    0 0% 96%;
    --foreground:          0 0% 9%;
    --muted-foreground:    0 0% 45%;

    --card:                0 0% 100%;
    --card-foreground:     0 0% 9%;
    --popover:             0 0% 100%;
    --popover-foreground:  0 0% 9%;

    --primary:             174 46% 35%;
    --primary-foreground:  0 0% 100%;

    --secondary:           0 0% 96%;
    --secondary-foreground:0 0% 9%;

    --muted:               0 0% 96%;
    --accent:              174 30% 90%;
    --accent-foreground:   174 46% 25%;

    --destructive:         0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --success:             142 71% 45%;
    --success-foreground:  0 0% 100%;

    --warning:             38 92% 50%;
    --warning-foreground:  0 0% 9%;

    --border:              0 0% 90%;
    --input:               0 0% 90%;
    --ring:                174 46% 35%;

    --radius:              0.5rem;

    /* Dashboard grafik renkleri */
    --chart-1:             174 46% 35%;
    --chart-2:             38 92% 50%;
    --chart-3:             0 72% 51%;
    --chart-4:             142 71% 45%;
    --chart-5:             0 0% 45%;

    /* Sidebar */
    --sidebar-background:  0 0% 98%;
    --sidebar-border:      0 0% 90%;
    --sidebar-accent:      174 30% 92%;
  }

  .dark {
    --background:          0 0% 4%;
    --background-muted:    0 0% 9%;
    --foreground:          0 0% 98%;
    --muted-foreground:    0 0% 64%;

    --card:                0 0% 9%;
    --card-foreground:     0 0% 98%;
    --popover:             0 0% 9%;
    --popover-foreground:  0 0% 98%;

    --primary:             174 48% 46%;
    --primary-foreground:  0 0% 4%;

    --secondary:           0 0% 15%;
    --secondary-foreground:0 0% 98%;

    --muted:               0 0% 15%;
    --accent:              174 20% 18%;
    --accent-foreground:   174 48% 70%;

    --destructive:         0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --success:             142 60% 40%;
    --success-foreground:  0 0% 100%;

    --warning:             38 80% 45%;
    --warning-foreground:  0 0% 4%;

    --border:              0 0% 22%;
    --input:               0 0% 22%;
    --ring:                174 48% 46%;

    --chart-1:             174 48% 46%;
    --chart-2:             38 80% 50%;
    --chart-3:             0 65% 55%;
    --chart-4:             142 55% 45%;
    --chart-5:             0 0% 64%;

    --sidebar-background:  0 0% 6%;
    --sidebar-border:      0 0% 15%;
    --sidebar-accent:      174 20% 12%;
  }
}
```

---

### `apps/web/tailwind.config.ts` — Token Entegrasyonu

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tüm renkler CSS değişkenlerinden gelir
        background:   "hsl(var(--background))",
        foreground:   "hsl(var(--foreground))",
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border:       "hsl(var(--border))",
        input:        "hsl(var(--input))",
        ring:         "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          background: "hsl(var(--sidebar-background))",
          border:     "hsl(var(--sidebar-border))",
          accent:     "hsl(var(--sidebar-accent))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans:  ["var(--font-geist-sans)"],
        mono:  ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 6. Package Görev Tanımları

### `packages/core/client/client.ts` — HTTP İstemcisi

```typescript
// Tüm API çağrılarının temeli. Başka hiçbir yerde fetch doğrudan kullanılmaz.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // HttpOnly cookie aktarımı için kritik
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const json = await response.json();

  // Backend standart response formatını işle: { statusCode, key, message, data, errors }
  if (!response.ok) {
    throw new ApiError(json.message, json.key, json.statusCode, json.errors);
  }

  return json.data as T;
}
```

### `packages/core/client/response-handler.ts` — Yanıt İşleyicisi

```typescript
// Backend ApiResponse<T> formatını parse ederek sadece `data` alanını döndürür.
// ApiError fırlatarak hataları standart hale getirir.

export function handleResponse<T>(json: ApiResponse<T>): T {
  if (json.statusCode >= 400) {
    throw new ApiError(json.message, json.key, json.statusCode, json.errors);
  }
  return json.data as T;
}
```

### `packages/state/query/keys.ts` — Query Key Factory

```typescript
// Type-safe query key'ler. Her domain için ayrı factory.
// Invalidation için kullanılır: queryClient.invalidateQueries(queryKeys.orders.all())

export const queryKeys = {
  orders: {
    all:    ()          => ["orders"] as const,
    list:   (params)    => ["orders", "list", params] as const,
    detail: (id: number)=> ["orders", "detail", id] as const,
    summary:()          => ["orders", "summary", "today"] as const,
  },
  products: {
    all:    ()          => ["products"] as const,
    detail: (id: number)=> ["products", "detail", id] as const,
  },
  inventory: {
    all:    ()          => ["inventory"] as const,
    lowStock:()         => ["inventory", "low-stock"] as const,
  },
  shipments: {
    all:    ()          => ["shipments"] as const,
    delayed:()          => ["shipments", "delayed"] as const,
    detail: (id: number)=> ["shipments", "detail", id] as const,
  },
  chat: {
    history:(sessionId: string) => ["chat", "history", sessionId] as const,
  },
};
```

### `packages/state/stores/auth/auth.store.ts` — Auth Store

```typescript
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({ user: null });
    // Yönlendirme ve durum yönetimi
  },
}));
// Not: Token kesinlikle store'da tutulmaz. Auth süreci HttpOnly cookie ile yürür.
```

---

## 7. Uygulama Yapısı — Sayfalar ve Routing

### Route Grupları ve Gerekçeleri

App Router'ın route group özelliği `(public)`, `(admin)`, `auth` gibi klasörler oluşturmayı sağlar. Bu klasörler URL'e yansımaz ama her grup için ayrı `layout.tsx` tanımlamaya olanak tanır.

```
/              → (public)/page.tsx         → PublicLayout
/chat          → (public)/chat/page.tsx    → PublicLayout
/dashboard     → (admin)/dashboard/page.tsx → AdminLayout (sidebar + header)
/orders        → (admin)/orders/page.tsx   → AdminLayout
/orders/128    → (admin)/orders/[id]/page.tsx → AdminLayout
/inventory     → (admin)/inventory/page.tsx → AdminLayout
/shipments     → (admin)/shipments/page.tsx → AdminLayout
/auth/login    → auth/login/page.tsx       → Kendi layout'u yok
```

### `middleware.ts` — Rota Koruması

```typescript
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/orders", "/products", "/inventory", "/shipments"];
const AUTH_PATHS      = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Cookie tabanlı auth. Token payload içeriğini middleware okumaz, sadece varlığını kontrol eder.
  const token = request.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthPage  = AUTH_PATHS.some(p => pathname.startsWith(p));

  // Korumalı sayfaya cookie olmadan → login'e yönlendir
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Zaten cookie varsa auth sayfalarından dashboard'a yönlendir
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### `(admin)/layout.tsx` — Admin Layout

```tsx
import { AdminSidebar } from "@/components/navigation/admin-sidebar";
import { AdminHeader }  from "@/components/navigation/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### Sayfa Detayları

#### `(admin)/dashboard/page.tsx`

```tsx
// SSR: İlk veriler sunucuda çekilir, hydration maliyet sıfır
// Polling: TanStack Query ile 30sn'de bir güncel veri

import { getDailySummary } from "@repo/domain/dashboard/api/dashboard.api";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@repo/state/query/keys";
import { DashboardContent } from "@repo/ui/components/dashboard";

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  // Sunucuda pre-fetch
  await queryClient.prefetchQuery({
    queryKey: queryKeys.orders.summary(),
    queryFn:  getDailySummary,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
```

**`DashboardContent` (Client Component):**
- `useDailySummary()` hook → `refetchInterval: 30_000`
- `StatCard` x4: Toplam Sipariş, Bekleyen, Kargoda, Günlük Ciro
- `OrderChart`: Recharts ile son 7 günlük bar chart
- `LowStockBanner`: Kritik stok ürünleri
- `RecentOrdersTable`: Bugünün siparişleri

#### `(admin)/orders/page.tsx`

- **URL state** (`nuqs`): `?page=1&status=pending&search=ahmet`
- **SSR**: `prefetchQuery` ile ilk sipariş listesi
- **TanStack Table**: Kolonlar — ID, Müşteri, Durum, Tutar, Tarih
- **Arama**: debounce (300ms) + nuqs URL sync
- **Filtre**: Durum dropdown → URL güncelleme
- **Sayfalama**: URL tabanlı, SSR uyumlu

#### `(public)/chat/page.tsx`

- **SSR Shell**: Sayfa metadata'sı ve ChatWindow kabı sunucudan gelir
- **CSR Chat Logic**: Mesajlar, input, session ID → client state
- **Optimistic Updates**: Kullanıcı mesajı anında UI'a yansır, API yanıtı beklenirken TypingIndicator gösterilir
- **Session ID**: Zustand store'dan alınır, yoksa `crypto.randomUUID()` ile oluşturulur
- **Framer Motion**: Mesajlar kayarak görünür (stagger animation)

---

## 8. State Management Stratejisi

### Hangi State Nerede?

| Veri Türü | Nerede Tutulur | Neden |
|-----------|----------------|-------|
| Sipariş listesi, ürünler | TanStack Query | API verisi, cache, refetch |
| Günlük özet (dashboard) | TanStack Query + polling | Periyodik güncelleme |
| Auth Durumu (Token) | HttpOnly Cookie | Güvenlik (Backend yönetir, JS erişemez) |
| Kullanıcı bilgisi | Zustand (`user`) | Hızlı UI güncellemeleri |
| Chat session ID | Zustand | Client-only, geçici |
| Optimistic chat mesajları | Zustand | UI önce güncelle |
| Sidebar açık/kapalı | Zustand | UI-only, no server |
| Filtre / sayfalama durumu | URL (nuqs) | SSR uyumlu, paylaşılabilir |
| Form state | React Hook Form | İzole, performanslı |

### TanStack Query Konfigürasyonu

```typescript
// packages/state/query/client.ts

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: shouldRetryQuery,      // 4xx retry yok, 5xx/network retry var
        retryDelay: exponentialBackoff,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        throwOnError: false,
      },
    },
  });
}
```

### Merkezi Query Key Sistemi

`packages/state/query/keys.ts` tüm domain'ler için tek query key factory kaynağıdır. Query key içinde endpoint string'i (`/api/...`) kullanılmaz; domain/scope mantığı kullanılır. Filtre objeleri `normalizeKeyParams()` ile alfabetik sıralanır, `null`/`undefined` alanlar atılır ve nested object'ler normalize edilir. Böylece aynı anlamdaki filtreler gereksiz ayrı cache entry üretmez.

Desteklenen key alanları:

```typescript
queryKeys.auth.me();
queryKeys.chat.history(sessionId);
queryKeys.orders.list(filters);
queryKeys.orders.detail(orderId);
queryKeys.orders.summaryToday();
queryKeys.products.list(filters);
queryKeys.products.detail(productId);
queryKeys.inventory.list(filters);
queryKeys.inventory.lowStock();
queryKeys.inventory.report(filters);
queryKeys.shipments.list(filters);
queryKeys.shipments.detail(shipmentId);
queryKeys.shipments.delayed(filters);
```

`QueryProvider`, `useState(() => createQueryClient())` ile browser session içinde tek `QueryClient` oluşturur. Development ortamında React Query Devtools dinamik import edilir ve component unmount olduktan sonra state update yapılmaması için `isMounted` guard kullanılır.

### Optimistic Update Örneği — Stok Güncelleme

```typescript
// domain/inventory/hooks/useUpdateStock.ts

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: UpdateStockInput) =>
      updateStock(productId, quantity),

    onMutate: async ({ productId, quantity }) => {
      // Devam eden sorguyu iptal et (race condition önlemi)
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all() });

      // Önceki state'i snapshot al (rollback için)
      const previousInventory = queryClient.getQueryData(queryKeys.inventory.all());

      // UI'ı anında güncelle (optimistic)
      queryClient.setQueryData(queryKeys.inventory.all(), (old: InventoryItem[]) =>
        old.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );

      return { previousInventory };
    },

    onError: (_err, _vars, context) => {
      // Hata olursa önceki state'e dön
      queryClient.setQueryData(queryKeys.inventory.all(), context?.previousInventory);
      toast.error("Stok güncellenemedi.");
    },

    onSuccess: () => {
      // Sunucudan taze veri çek
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      toast.success("Stok güncellendi.");
    },
  });
}
```

---

## 9. API Entegrasyon Katmanı

### Tek İstemci, İki Farklı Bağlam

Next.js App Router'da API çağrıları için aynı temel istemci kullanılır ancak iki farklı bağlamda çalışır:

| Bağlam | Dosya konumu | Auth | Kullanım |
|--------|-------------|------|----------|
| **React Server Components** | `domain/*/api/*.ts` veya doğrudan fetch | Interceptor / Cookie (`cookies()`) | `page.tsx` içinde prefetch |
| **Client Components** | `domain/*/hooks/*.ts` | HttpOnly cookie + credentials include | Interaktif işlemler |

### `domain/clients/api-client.ts` — Ortak İstemci Yapılandırması

```typescript
// Hem RSC hem de CSR bağlamında çalışabilir, tek bir backend URL kullanır.
// Tüm API path'leri /api/... ile başlar.

import { ApiClient } from '@repo/core/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const apiClient = new ApiClient(API_BASE_URL);
```

### `domain/orders/hooks/useOrders.ts` — Client-Side Hook

```typescript
// Browser bağlamında çalışır. Auth HttpOnly cookie üzerinden ilerler.

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@repo/state/query/keys";
import { getOrdersClient } from "../api/orders.api";

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey:  queryKeys.orders.list(params),
    queryFn:   () => getOrdersClient(params),
    staleTime: 60_000,
  });
}
```

### API Error Handling

```typescript
// packages/core/client/api-error.ts

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly key: string,         // "NOT_FOUND", "UNAUTHORIZED" vb.
    public readonly statusCode: number,
    public readonly errors?: ValidationError[],
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized()  { return this.statusCode === 401; }
  get isNotFound()      { return this.statusCode === 404; }
  get isValidation()    { return this.statusCode === 422; }
  get isServerError()   { return this.statusCode >= 500; }
}

// Interceptor: 401 geldiğinde otomatik yönlendirme
// packages/core/client/interceptors.ts

export async function withAuthInterceptor(response: Response): Promise<Response> {
  if (response.status === 401) {
    // Backend zaten HttpOnly cookie'yi silecek veya geçersiz kılacaktır.
    useAuthStore.getState().logout();
    window.location.href = "/auth/login";
  }
  // Not: Authorization Bearer token manuel eklenmez. Tarayıcı cookie'leri otomatik gönderir.
  return response;
}
```

---

## 10. Component Mimarisi

### Component Hiyerarşisi

```
Page (RSC)
  └── HydrationBoundary
        └── ContentComponent (CC — "use client")
              ├── shadcn/ui primitive'leri
              ├── packages/ui-web/components/layout/
              │     PageShell, AdaptiveGrid, SplitLayout... (Responsive Primitives)
              ├── packages/ui/components/shared/
              │     DataTable, PageHeader, EmptyState...
              └── packages/ui/components/{domain}/
                    OrderTable, StatCard, ChatWindow...
```

### Responsive Design & Layout Sistemi

Sistem genelinde responsive davranışları rastgele class'larla (`sm:flex-col md:w-1/2`) kontrol etmek yerine merkezi yapı kullanılır:

- **Theme & Token**: `packages/theme` responsive breakpoint, spacing, typography ve density tokenlarını sağlar.
- **CSS Değişkenleri**: `globals.css` bu tokenları CSS variable olarak tanımlar; `tailwind.config.ts` utility classlara bağlar (örn. `px-card`, `text-display`).
- **Layout Primitives**: Sayfalar, esnek ve mobil-öncelikli olan `PageShell`, `AdaptiveGrid`, `ResponsiveSection`, `ResponsiveStack` ve `SplitLayout` primitive'lerini kullanarak şekillenir.
- **Mobile First**: Tablolar, formlar ve dialog/sheet yapıları ilk aşamada mobile uyumlu olacak şekilde geliştirilir, desktop görünümü container'ın genişlemesi ile ele alınır.
- Componentlerde hardcode padding/margin yerine `density`, `size`, `variant` gibi prop tabanlı konfigürasyon tercih edilir.

### Generic DataTable — TanStack Table Wrapper

```tsx
// packages/ui/components/shared/DataTable.tsx

"use client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "../shadcn/table";
import { cn } from "@repo/core/utils/cn";

interface DataTableProps<T> {
  data:      T[];
  columns:   ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, isLoading, emptyMessage }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <DataTableSkeleton columns={columns.length} />;

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-12">
                {emptyMessage ?? "Kayıt bulunamadı."}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### OrderStatusBadge — Semantic Renk Kullanımı

```tsx
// packages/ui/components/orders/OrderStatusBadge.tsx
// Hardcode renk kullanımı YASAK — tüm renkler cn() ve semantic class'lardan gelir

import { Badge } from "../shadcn/badge";
import { cn } from "@repo/core/utils/cn";
import type { OrderStatus } from "@repo/domain/orders/types";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: "Bekliyor",   className: "bg-warning/15 text-warning-foreground border-warning/30" },
  processing: { label: "Hazırlanıyor",className:"bg-accent text-accent-foreground border-accent-foreground/20"},
  shipped:    { label: "Kargoda",    className: "bg-primary/15 text-primary border-primary/30" },
  delivered:  { label: "Teslim",     className: "bg-success/15 text-success border-success/30" },
  cancelled:  { label: "İptal",      className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", className)}>
      {label}
    </Badge>
  );
}
```

### ChatWindow — Müşteri Chat Arayüzü

```tsx
// packages/ui/components/chat/ChatWindow.tsx
// Optimistic updates + animasyon + scroll-to-bottom

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore }     from "@repo/state/stores/chat";
import { useSendMessage }   from "@repo/domain/chat/hooks";
import { ChatMessageList }  from "./ChatMessageList";
import { ChatInput }        from "./ChatInput";
import { TypingIndicator }  from "./TypingIndicator";

export function ChatWindow() {
  const { messages, sessionId, addMessage } = useChatStore();
  const { mutate: sendMessage, isPending }  = useSendMessage();

  const handleSend = (content: string) => {
    // 1. Optimistic: kullanıcı mesajını hemen göster
    addMessage({ role: "user", content, id: crypto.randomUUID() });

    // 2. API çağrısı
    sendMessage({ content, session_id: sessionId }, {
      onSuccess: (data) => {
        addMessage({ role: "assistant", content: data.reply, id: crypto.randomUUID() });
      },
    });
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm">
      <ChatMessageList messages={messages} />
      <AnimatePresence>
        {isPending && <TypingIndicator />}
      </AnimatePresence>
      <ChatInput onSend={handleSend} disabled={isPending} />
    </div>
  );
}
```

---

## 11. SSR / CSR Hibrit Strateji

### Sayfa Başına Rendering Kararı

Her sayfada rendering stratejisi, kullanıcı etkileşimi ve data freshness gereksinimlerine göre belirlenir. Bu iki faktörün dengesi belirleyicidir.

| Sayfa | Strateji | Gerekçe |
|-------|----------|---------|
| **Landing** | Full SSR | Statik içerik, SEO önemli |
| **Dashboard** | SSR + Client Polling | İlk veri sunucuda, güncel veri polling ile |
| **Siparişler** | SSR Prefetch + CSR filter | İlk liste sunucuda, filtre/arama client |
| **Sipariş Detayı** | SSR | Statik detay sayfası |
| **Stok** | SSR + Client Polling (60s) | Anlık stok kritik, sık güncelleme |
| **Kargo** | SSR | Seyrek güncelleme |
| **Chat** | SSR Shell + Full CSR | Konuşma tamamen real-time |
| **Login** | Full CSR | Form etkileşimi, SSR gerekmez |

### Prefetch Pattern (SSR + Hydration)

```tsx
// Tüm admin sayfalarda uygulanan standart pattern:

// 1. page.tsx (RSC) — Sunucuda veri çek
export default async function OrdersPage({ searchParams }) {
  const queryClient = new QueryClient();
  const params = { page: Number(searchParams.page ?? 1), status: searchParams.status };

  await queryClient.prefetchQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn:  () => getOrdersServer(params),   // server-side client
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersContent initialParams={params} />  {/* Client Component */}
    </HydrationBoundary>
  );
}

// 2. OrdersContent.tsx (CC) — Client'ta devam et
"use client";
export function OrdersContent({ initialParams }) {
  const [params, setParams] = useQueryState(...)  // nuqs
  const { data, isLoading } = useOrders(params);  // TanStack Query — cache'ten başlar
  // ...
}
```

### Loading UI — Streaming ile Skeleton

Her sayfa için `loading.tsx` tanımlanır. App Router, `page.tsx` yüklenirken otomatik olarak bu dosyayı gösterir (Suspense + Streaming).

```tsx
// app/(admin)/orders/loading.tsx
import { OrderTableSkeleton } from "@repo/ui/components/orders";

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
      <OrderTableSkeleton rows={10} />
    </div>
  );
}
```

---

## 12. i18n — Çoklu Dil Desteği

### Desteklenen Diller

- **Türkçe (tr)** — Varsayılan
- **İngilizce (en)** — İkincil

### Locale Dosyası Örneği

```json
// packages/i18n/locales/tr/orders.json
{
  "title": "Siparişler",
  "columns": {
    "id": "Sipariş No",
    "customer": "Müşteri",
    "status": "Durum",
    "amount": "Tutar",
    "date": "Tarih"
  },
  "status": {
    "pending":    "Bekliyor",
    "processing": "Hazırlanıyor",
    "shipped":    "Kargoda",
    "delivered":  "Teslim Edildi",
    "cancelled":  "İptal"
  },
  "filters": {
    "all":      "Tümü",
    "search":   "Müşteri ara...",
    "dateRange":"Tarih Aralığı"
  },
  "empty": "Henüz sipariş bulunmamaktadır.",
  "error": "Siparişler yüklenirken hata oluştu."
}
```

### Dil Seçici

Kullanıcı dil tercihini değiştirdiğinde Zustand `language.store.ts` güncellenir, URL yeniden yüklenmeden i18next instance değiştirilir.

---

## 13. Geliştirme Yol Haritası — Gün Gün

Backend planıyla paralel ilerler. Backend'in ilgili endpoint'leri hazır olmadan frontend mock data ile çalışır.

### GÜN 1 — Monorepo Kurulumu + Tema + Auth

**Sabah (4 saat): Temel Altyapı**

```
Adım 1: Monorepo iskeletini oluştur
  mkdir -p apps/web packages/{core,domain,state,theme,ui,i18n,ui-contracts,typescript-config,eslint-config}
  pnpm-workspace.yaml yaz
  turbo.json yaz (build, dev, lint, type-check pipeline)
  kök package.json yaz

Adım 2: TypeScript config'leri oluştur
  packages/typescript-config/base.json
  packages/typescript-config/nextjs.json
  packages/typescript-config/react-library.json

Adım 3: ESLint config'leri oluştur
  packages/eslint-config/base.js, next.js, react-internal.js

Adım 4: apps/web Next.js kurulumu
  pnpm create next-app apps/web --ts --tailwind --app --no-src-dir
  next.config.ts — transpilePackages ayarla
  tsconfig.json — @repo/* path alias'ları ekle

Adım 5: Semantic tema sistemini kur
  packages/theme/tokens.ts — Ham palet
  packages/theme/semantic.ts — Semantic mapping
  apps/web/globals.css — CSS değişkenleri (light + dark)
  apps/web/tailwind.config.ts — CSS değişkenlerini Tailwind'e bağla

TEST: pnpm dev → localhost:3000 açılıyor, renk değişkenleri CSS'de görünüyor
```

**Öğleden Sonra (4 saat): Core + State + UI Temeli**

```
Adım 6: packages/core kur
  client.ts, interceptors.ts, response-handler.ts, api-error.ts, types.ts
  utils/cn.ts — clsx + tailwind-merge
  utils/format.ts — tarih, para, telefon formatları
  hooks/useDebounce.ts

Adım 7: packages/state kur
  query/client.ts — QueryClient (defaultOptions)
  query/provider.tsx — QueryClientProvider
  query/keys.ts — Tüm domain query key factory'leri
  stores/auth/auth.store.ts — Zustand UI state
  stores/ui/ui.store.ts — sidebar state
  stores/chat/chat.store.ts — session, messages

Adım 8: shadcn/ui kur (packages/ui içinde)
  pnpm dlx shadcn@latest init
  Gerekli component'leri ekle:
  button, card, input, label, badge, table, dialog, sheet,
  select, separator, skeleton, tooltip, dropdown-menu,
  avatar, progress, scroll-area, command, form, alert

Adım 9: Providers composition (apps/web/components/providers/)
  query-provider.tsx, theme-provider.tsx, index.tsx
  apps/web/app/layout.tsx'e ekle (Providers, Geist font, Toaster)
```

**Akşam (2 saat): Auth Sayfaları**

```
Adım 10: packages/domain/auth kur
  auth.api.ts — login(), register(), getMe() (Endpoint: /api/auth/login vb.)
  auth.schema.ts — Zod: LoginSchema, RegisterSchema
  hooks: useLogin, useRegister, useMe

Adım 11: apps/web/middleware.ts yaz (HttpOnly Cookie kontrolü)

Adım 12: Login ve Register sayfaları
  app/auth/login/page.tsx — react-hook-form + zodResolver
  app/auth/register/page.tsx

TEST: Login → backend HttpOnly cookie set etti → /dashboard'a yönlendi
```

---

### GÜN 2 — Admin Layout + Dashboard + Siparişler

**Sabah (4 saat): Admin Layout ve Dashboard**

```
Adım 13: Admin navigation component'leri
  apps/web/components/navigation/admin-sidebar.tsx
    - Logo, nav items (Dashboard, Siparişler, Ürünler, Stok, Kargo)
    - Collapsed/Expanded Zustand state
    - Active route highlight (usePathname)
  apps/web/components/navigation/admin-header.tsx
    - Breadcrumb, kullanıcı dropdown, tema toggle

Adım 14: (admin)/layout.tsx — AdminSidebar + AdminHeader + main

Adım 15: packages/domain/orders kur
  orders.api.ts, hooks, types, schemas
  clients/dashboard-client.ts, clients/orders-client.ts

Adım 16: Dashboard page + content
  (admin)/dashboard/page.tsx — SSR prefetch
  packages/ui/components/dashboard/:
    StatCard.tsx — 4 metrik kartı
    OrderChart.tsx — Recharts BarChart (son 7 gün)
    LowStockBanner.tsx — kritik stok uyarısı
    RecentOrdersTable.tsx — bugünün siparişleri

TEST: Dashboard SSR çalışıyor, polling 30sn'de yeniliyor
```

**Öğleden Sonra (4 saat): Siparişler**

```
Adım 17: Siparişler listesi
  (admin)/orders/page.tsx — SSR prefetch
  packages/ui/components/orders/OrderTable.tsx — TanStack Table
    Kolonlar: ID, Müşteri, Durum, Tutar, Tarih, Aksiyon
  OrderStatusBadge.tsx — semantic renkli badge'ler

Adım 18: Filtre + arama + sayfalama
  nuqs kurulumu → useQueryState ile URL sync
  Search input (useDebounce, 300ms)
  Durum filtresi (shadcn Select)
  Sayfalama (URL tabanlı)

Adım 19: Sipariş detay sayfası
  (admin)/orders/[id]/page.tsx — SSR
  OrderDetailCard.tsx — müşteri bilgisi, ürünler
  OrderStatusSelect.tsx — durum güncelleme (useMutation)
  Kargo bilgisi alanı

TEST: Sipariş listesi filter/arama URL'de, detay SSR çalışıyor
```

**Akşam (2 saat): Ürünler**

```
Adım 20: packages/domain/products kur

Adım 21: Ürün listesi + detay
  (admin)/products/page.tsx — SSR + TanStack Table
  Ürün ekleme: shadcn Sheet içinde react-hook-form
  Ürün güncelleme: inline Dialog

TEST: Ürün ekleme formu çalışıyor, validasyon hatası standart gösteriliyor
```

---

### GÜN 3 — Stok + Kargo + Chat + Finalizasyon

**Sabah (4 saat): Stok ve Kargo**

```
Adım 22: packages/domain/inventory kur (60sn polling)

Adım 23: Stok sayfası
  (admin)/inventory/page.tsx — SSR + polling
  StockTable.tsx — inline edit (optimistic update)
  StockLevelBar.tsx — görsel dolu bar
  LowStockAlert.tsx — kritik ürün satırı
  LowStockBanner global (eşik altı varsa sayfanın üstünde)

Adım 24: packages/domain/shipments kur

Adım 25: Kargo sayfası
  (admin)/shipments/page.tsx — SSR
  ShipmentTable.tsx — durum, tracking, tahmini
  ShipmentStatusBadge.tsx — in_transit/delayed/delivered
  RefreshButton.tsx — durumu manuel güncelle (useMutation)
  Geciken kargolar filtered view

TEST: Stok optimistic update, kargo refresh çalışıyor
```

**Öğleden Sonra (3 saat): Chat**

```
Adım 26: packages/domain/chat kur
  chat.api.ts, useSendMessage, useChatHistory
  stores/chat/chat.store.ts (sessionId, messages, addMessage)

Adım 27: Public layout ve landing sayfası
  (public)/layout.tsx — public-header + footer
  (public)/page.tsx — Hero, feature section, CTA

Adım 28: Chat sayfası
  (public)/chat/page.tsx — SSR shell
  ChatWindow.tsx — optimistic messages, TypingIndicator
  ChatMessage.tsx — Framer Motion slide-in animasyonu
  ChatInput.tsx — textarea, gönder butonu

TEST: Chat mesaj gönder → optimistic görünüm → API yanıtı → agent cevabı
```

**Akşam (3 saat): Finalizasyon**

```
Adım 29: Hata ve loading durumları
  Her sayfada loading.tsx (Skeleton)
  Her sayfada error.tsx (retry butonu)
  EmptyState component'leri
  Global ApiError toast (Sonner entegrasyonu)

Adım 30: Dark mode
  next-themes ThemeProvider
  AdminHeader'da tema toggle (Moon/Sun icon)
  globals.css .dark class doğru çalışıyor mu?

Adım 31: i18n Türkçe
  packages/i18n/locales/tr — tüm namespace'ler
  Tüm hardcode string'leri t('key') ile değiştir

Adım 32: Responsive kontrol
  Sidebar mobile'da drawer olarak davranıyor mu?
  Tablolar mobile'da scroll ediyor mu?

Adım 33: Son kontrol
  pnpm lint — hata yok
  pnpm type-check — TypeScript hata yok
  docker-compose up → backend ayakta → frontend ile E2E test
  Demo senaryoları: chat → sipariş sorgu → stok uyarı → dashboard
```

---

## 14. Geliştirme Kuralları

> Bu kurallar hem geliştiriciler hem de AI geliştirme ajanı için bağlayıcıdır.

### Renk ve Tema Kuralları

1. Component kodunda asla `text-red-500`, `bg-blue-600`, `border-gray-200` gibi Tailwind doğrudan renk sınıfları kullanılmaz.
2. Tüm renkler CSS değişkenleri üzerinden gelir: `text-destructive`, `bg-primary`, `border-border`.
3. Yeni bir renk ihtiyacı doğduğunda önce `globals.css`'e CSS değişkeni eklenir, sonra `tailwind.config.ts`'e kaydedilir.
4. Siyah ve beyaz dahil tüm nötr renkler `foreground`, `background`, `muted` token'ları üzerinden kullanılır.

### Katman Kuralları

5. `apps/web/app/` içindeki `page.tsx` dosyaları yalnızca RSC olur (async, veri pre-fetch). İş mantığı içermez.
6. `"use client"` direktifi yalnızca gerçekten gerekli olan component'lere eklenir. Varsayılan RSC'dir.
7. API çağrıları doğrudan `page.tsx` veya component içinden yapılmaz. `domain/*/api/*.ts` fonksiyonları kullanılır.
8. TanStack Query hook'ları yalnızca Client Component içinde çağrılır.
9. Server Component içinde `window`, `document`, `localStorage` kullanılmaz.

### State Kuralları

10. API verisi Zustand'a konulmaz. TanStack Query cache'i bu işi yapar.
11. UI state'i (modal açık, input değeri) TanStack Query'ye konulmaz. React state veya Zustand kullanılır.
12. Filtre ve sayfalama parametreleri URL'de tutulur (`nuqs`). Component state'e konulmaz.

### Component Kuralları

13. Her component kendi dosyasında olur. Birden fazla export eden index barrel dosyaları domain düzeyinde tanımlanır.
14. Prop tiplerinin canonical tanımı `packages/ui-contracts` içinde bulunur. Hem `packages/ui` hem `apps/web` bu tipleri import eder.
15. shadcn/ui component'leri doğrudan kullanılmadan önce `packages/ui/components/shadcn/` içine kopyalanır. Uygulama kodundan doğrudan `@radix-ui/*` import edilmez.
16. `cn()` yardımcısı her zaman className birleştirmek için kullanılır. String concatenation veya template literal kullanılmaz.

### Hata Yönetimi Kuralları

17. API hataları `ApiError` sınıfıyla yakalanır. `key` alanından hatanın türü belirlenir.
18. 401 hatası geldiğinde `interceptors.ts` otomatik logout yapar; component'ler bu durumu ayrıca işlemek zorunda değildir.
19. Kullanıcıya gösterilen hata mesajları backend'in `message` alanından gelir. Hardcode hata mesajı kullanılmaz.
20. Her mutation başarıya veya hataya göre Sonner toast gösterir. Toast kopyası i18n key'den gelir.

### Kod Kalitesi

21. TypeScript `strict` mod aktiftir. `any` tipi kullanılmaz; gerekirse `unknown` ve type guard kullanılır.
22. Her domain hook'unun return tipi açıkça belirtilir. Inference'e bırakılmaz.
23. Bir component 150 satırı geçtiğinde alt component'lere bölünür.
24. `console.log` production kodunda bulunmaz. Debug için geliştirme ortamında koşullu log kullanılır.

---

*Son güncelleme: MVP v1.0 — Backend planıyla tam uyumlu, 3 günlük hackathon planı*
