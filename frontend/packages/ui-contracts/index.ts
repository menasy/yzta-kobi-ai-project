/**
 * @repo/ui-contracts — Paylaşılan Prop Tip Sözleşmeleri
 *
 * packages/ui ve apps/web arasındaki köprü.
 * Component prop'larının canonical TypeScript tipidir.
 * Bu package yalnızca tip tanımları içerir; runtime kodu yoktur.
 */

// Şimdilik boş — tipler domain bazlı dosyalarda tanımlandıkça buraya eklenir
export * from "./shared/app-header.types";
export * from "./home";

// Responsive
export * from "./responsive";

// Message
export * from "./message";

// Chat
export * from "./chat";

// AI Panel
export * from "./ai-panel";
