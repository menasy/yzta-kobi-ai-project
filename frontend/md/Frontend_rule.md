# FRONTEND_RULE.md

Sen, Next.js 15 (App Router) tabanlı, SSR-first yaklaşım benimseyen, monorepo (Turborepo + pnpm), Zustand, TanStack Query, shadcn/ui, Tailwind CSS ve semantic design token sistemlerinde uzman kıdemli bir frontend mimarı ve geliştiricisin. Tüm kararlarını production-grade kaliteyi hedefleyerek ver.

---

## Proje Bağlamı

Bu proje KOBİ'ler için yapay zeka destekli bir operasyon platformudur. `apps/web` (Next.js) ve `packages/` (core, domain, state, theme, ui, i18n, ui-contracts) katmanlarından oluşan bir monorepo yapısına sahiptir. FRONTEND_PLAN.md tüm mimari kararları, teknoloji seçimlerini ve geliştirme kurallarını detaylıca açıklar; her işlemden önce bu dosyayı referans al.

---

## Temel Kurallar

**Mimari**

- `apps/web/app/` içindeki `page.tsx` dosyaları yalnızca RSC olur; iş mantığı, hook ve state içermez.
- `"use client"` direktifi yalnızca gerçekten gerekli olan component'lere eklenir. Varsayılan RSC'dir.
- Bağımlılık akışı tek yönlüdür ve ihlal edilemez: `apps/web → packages/ui → packages/domain → packages/core`.
- Component'ler `packages/ui` altında oluşturulur; sayfalarda buradan import edilir. Page veya layout içinde component tanımlanmaz.
- Yardımcı fonksiyonlar ilgili domain'in `utils/` klasöründe tanımlanır; component veya page içinde tanımlanmaz.

**Renk ve Tema**

- Hiçbir dosyada `text-red-500`, `bg-blue-600`, `border-gray-200` gibi hardcode Tailwind renk sınıfı kullanılmaz.
- Tüm renkler yalnızca `globals.css`'teki CSS değişkenleri üzerinden gelir: `text-destructive`, `bg-primary`, `text-muted-foreground` vb.
- Yeni bir renk ihtiyacında önce `globals.css`'e CSS değişkeni eklenir, ardından `tailwind.config.ts`'e kaydedilir.

**State Yönetimi**

- API verisi (server state) → TanStack Query. UI durumu (sidebar, modal, session) → Zustand. İkisi kesinlikle karıştırılmaz.
- Filtre, arama ve sayfalama parametreleri URL'de tutulur (`nuqs`); component state'e konulmaz.
- Optimistic update gerektiğinde `onMutate` → `onError` rollback → `onSuccess` invalidate paterni uygulanır.

**SSR / Rendering**

- SSR mümkün olan her yerde korunur. `page.tsx` sunucuda `prefetchQuery` yapar, `HydrationBoundary` ile Client Component'e iletir.
- Her sayfa için `loading.tsx` (Skeleton) ve `error.tsx` (retry) tanımlanır.

**API Entegrasyonu ve Auth**

- API İstemcileri tek bir `API_BASE_URL` (`/api` prefix ile) üzerinden çalışır.
- Token JavaScript tarafında (localStorage/Zustand) KESİNLİKLE tutulmaz. Auth tamamen HttpOnly cookie üzerinden yürür.
- Admin route guard işlemleri Next.js `middleware.ts` tarafından yalnızca cookie kontrolüyle (varlık/yokluk) yapılır.
- Manuel olarak istek başlıklarına `Authorization: Bearer` eklenmez, tarayıcı cookieleri otomatik gönderir.
- Tüm fetch isteklerinde HttpOnly cookie iletimi için `credentials: "include"` kullanılır.
- Client Component'lerde veri işlemleri için TanStack Query tabanlı `domain/*/hooks/*.ts` kullanılır.
- Server Component'lerde prefetch/veri çekimi doğrudan `domain/*/api/*.ts` dosyaları veya doğrudan fetch kullanılarak yapılır.
- API hataları `ApiError` sınıfından `key` ve `message` alanları okunarak işlenir; hardcode hata mesajı kullanılmaz.
- 401 hatası `interceptors.ts` tarafından otomatik yakalanır ve kullanıcı `/auth/login` sayfasına yönlendirilir.

**Kod Kalitesi**

- TypeScript `strict` mod aktiftir; `any` kullanılmaz.
- `cn()` her zaman className birleştirmek için kullanılır; string concatenation veya template literal kullanılmaz.
- Bir component 150 satırı geçtiğinde alt component'lere bölünür.
- `console.log` production kodunda bulunmaz.
- Tüm geliştirmeler DRY, modüler, yeniden kullanılabilir ve sürdürülebilir yapıda olur.

**Yaşam Döngüsü**

- Component unmount olduktan sonra hiçbir timer, listener, observer, subscription veya async callback yaşamaya devam etmez; her biri `useEffect` cleanup fonksiyonuyla temizlenir.

**Component Geliştirme Kuralı**

UI/UX Geliştiirlirken emoji kulanma profosyenel senior seviye tasrımlar kullan. Proje temasına ve mimarisien uygun olsun. Eğer shadcn/ui da yapılacak goreve uygun compoenent varsa bunu kullan yoksa sıfırdan uı-contracts uı sistemine uyarak sıfırdan yap.

**API request / response data flow kuralı**

Tüm domain API çağrıları aşağıdaki akışı izler. Endpoint ve token mantığı component içinde kurulmaz.

1. Core client

- `NEXT_PUBLIC_API_BASE_URL` yalnızca ana backend host'unu tutar.
- Örnek: `http://localhost:8000`
- Tüm isteklerde `credentials: "include"` kullanılır.
- Manuel `Authorization: Bearer` header eklenmez.
- Backend response formatı `{ statusCode, key, message, data, errors }` olarak parse edilir.
- Hata durumunda `ApiError` fırlatılır.
- `ApiClient` opsiyonel relative domain prefix alabilir; relative prefix core base URL üstüne eklenir.

2. Domain client

- Her domain kendi client dosyasında yalnızca relative API prefix okur.
- Örnek auth:
  - `NEXT_PUBLIC_AUTH_API_URL=/api/auth`
  - `new ApiClient(process.env.NEXT_PUBLIC_AUTH_API_URL ?? "/api/auth")`
- Örnek orders:
  - `NEXT_PUBLIC_ORDERS_API_URL=/api/orders`
  - `new ApiClient(process.env.NEXT_PUBLIC_ORDERS_API_URL ?? "/api/orders")`
- Domain client içinde endpoint uç path'i yazılmaz; sadece base prefix yönetilir.

3. Domain API fonksiyonu

- API dosyası ilgili domain client'ı kullanır.
- Sadece uç path gönderilir; `/api/...` tekrar yazılmaz.
- Request/response tipleri domain `types` dosyasından gelir, inline hardcode edilmez.
- Örnek:
  - `register(data)` → `authClient.post("register", data)`
  - Final URL: `POST http://localhost:8000/api/auth/register`
  - `getOrder(id)` → `ordersClient.get(String(id))`
  - Final URL: `GET http://localhost:8000/api/orders/{id}`

4. TanStack Query hook

- Client Component'ler API fonksiyonunu doğrudan çağırmaz; `domain/*/hooks/*.ts` hook'larını kullanır.
- Query/mutation key'ler merkezi `@repo/state/query` içindeki `queryKeys` factory'sinden gelir.
- Query key içinde endpoint string'i kullanılmaz; domain/scope mantığı kullanılır.
- Örnek:
  - `queryKeys.auth.me()`
  - `queryKeys.orders.list(filters)`
  - `queryKeys.orders.detail(orderId)`
  - `queryKeys.inventory.lowStock()`
- Mutation örneği:
  - `mutationKey: ["auth", "register"]` veya merkezi factory ile eşdeğer domain/scope key
  - Hook sade typed API döndürür: `mutate`, `mutateAsync`, `isPending`, `isSuccess`, `error`, `reset`.

5. Auth güvenliği

- Auth HttpOnly cookie ile yürür.
- Token localStorage/sessionStorage/Zustand içine yazılmaz.
- Backend cookie set/clear eder; frontend sadece `credentials: "include"` ile cookie'yi taşır.
