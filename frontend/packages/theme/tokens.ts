/**
 * Ham renk paleti — HSL formatında sadece değerler
 * Bu dosya yalnızca primitif değerleri içerir, semantic anlam yoktur.
 * Semantic anlam için semantic.ts dosyasına bakın.
 */
export const palette = {
  // Nötr tonlar (achromatic scale)
  neutral: {
    0:    "0 0% 100%",  // beyaz
    50:   "0 0% 98%",
    100:  "0 0% 96%",
    200:  "0 0% 90%",
    300:  "0 0% 83%",
    400:  "0 0% 64%",
    500:  "0 0% 45%",
    600:  "0 0% 32%",
    700:  "0 0% 22%",
    800:  "0 0% 15%",
    900:  "0 0% 9%",
    950:  "0 0% 4%",
    1000: "0 0% 0%",   // siyah
  },

  // Marka rengi — koyu yeşil-mavi (KOBİ güveni ve profesyonellik)
  primary: {
    50:  "174 60% 95%",
    100: "174 58% 88%",
    200: "174 55% 75%",
    300: "174 50% 60%",
    400: "174 48% 46%",
    500: "174 46% 35%",  // ana marka rengi
    600: "174 48% 28%",
    700: "174 50% 22%",
    800: "174 52% 16%",
    900: "174 55% 10%",
  },

  // Başarı — yeşil
  success: {
    50:  "142 76% 95%",
    100: "142 72% 88%",
    500: "142 71% 45%",
    600: "142 60% 40%",
    700: "142 74% 30%",
  },

  // Uyarı — amber
  warning: {
    50:  "38 92% 95%",
    100: "38 90% 88%",
    500: "38 92% 50%",
    600: "38 80% 45%",
    700: "32 95% 35%",
  },

  // Hata / Tehlike — kırmızı
  destructive: {
    50:  "0 86% 97%",
    100: "0 84% 92%",
    500: "0 72% 51%",
    600: "0 65% 55%",
    700: "0 75% 38%",
  },
} as const;

export type PaletteKey = keyof typeof palette;
