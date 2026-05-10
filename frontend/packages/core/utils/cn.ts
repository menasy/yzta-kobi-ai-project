import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — className birleştirme yardımcısı
 *
 * clsx ile koşullu sınıfları işle, tailwind-merge ile çakışmaları çöz.
 * Her zaman bu fonksiyon kullanılır; string concatenation veya template literal yasaktır.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
