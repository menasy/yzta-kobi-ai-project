/**
 * @repo/domain — İş Alanı Katmanı
 *
 * API çağrıları, TanStack Query hook'ları, Zod şemaları ve TypeScript tipleri.
 * packages/core'u import eder; packages/ui'ı import edemez.
 */

// Auth domain
export * from "./auth/index";

// AI domain
export * from "./ai/index";

// Chat domain
export * from "./chat/index";

// Orders domain
export * from "./orders/index";

// Products domain
export * from "./products/index";

// Inventory domain
export * from "./inventory/index";

// Shipments domain
export * from "./shipments/index";

// Customer domain
export * from "./customer/index";
