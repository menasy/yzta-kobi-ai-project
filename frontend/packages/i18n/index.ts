/**
 * @repo/i18n — Çoklu Dil Desteği
 *
 * Desteklenen diller: tr (varsayılan), en
 * Server Component'lerde getTranslation() kullanılır.
 */

// Şimdilik boş — i18n kurulumu sonraki adımda yapılacak
export const SUPPORTED_LANGUAGES = ["tr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "tr";
