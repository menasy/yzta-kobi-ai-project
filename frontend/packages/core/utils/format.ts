/**
 * Format yardımcıları — para, tarih, telefon formatları
 * tree-shakeable — sadece kullandığınız fonksiyonu import edin.
 */

/**
 * Türk Lirası formatı
 * @example formatCurrency(1500) → "₺1.500,00"
 */
export function formatCurrency(
  amount: number,
  locale = "tr-TR",
  currency = "TRY",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Tarih formatı
 * @example formatDate("2024-01-15") → "15 Ocak 2024"
 */
export function formatDate(
  date: string | Date,
  locale = "tr-TR",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Kısa tarih formatı
 * @example formatDateShort("2024-01-15") → "15.01.2024"
 */
export function formatDateShort(date: string | Date, locale = "tr-TR"): string {
  return formatDate(date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Göreli zaman formatı
 * @example formatRelativeTime(new Date()) → "Az önce"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatDateShort(d);
}

/**
 * Türk telefon numarası formatı
 * @example formatPhone("5321234567") → "+90 532 123 45 67"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const national = cleaned.startsWith("90") ? cleaned.slice(2) : cleaned;
  if (national.length !== 10) return phone;
  return `+90 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 8)} ${national.slice(8)}`;
}

/**
 * Sayı formatı (binlik ayraç)
 * @example formatNumber(1500000) → "1.500.000"
 */
export function formatNumber(n: number, locale = "tr-TR"): string {
  return new Intl.NumberFormat(locale).format(n);
}
