/**
 * Semantic tokenlar — globals.css CSS değişkenlerinin TypeScript yansıması.
 * Her isim, CSS değişken adıyla 1:1 eşleşir.
 * Component'lerde bu token isimlerini Tailwind utility sınıfı olarak kullanın:
 *   bg-primary, text-foreground, border-border, ring-ring vb.
 */
export const semanticTokens = {
  light: {
    // Arkaplan katmanları
    background:              "var(--background)",
    backgroundMuted:         "var(--background-muted)",
    backgroundCard:          "var(--card)",
    backgroundPopover:       "var(--popover)",

    // Metin
    foreground:              "var(--foreground)",
    foregroundMuted:         "var(--muted-foreground)",
    foregroundCard:          "var(--card-foreground)",
    foregroundPopover:       "var(--popover-foreground)",

    // Marka (Primary)
    primary:                 "var(--primary)",
    primaryForeground:       "var(--primary-foreground)",

    // İkincil
    secondary:               "var(--secondary)",
    secondaryForeground:     "var(--secondary-foreground)",

    // Pasif / gri tonu
    muted:                   "var(--muted)",
    mutedForeground:         "var(--muted-foreground)",

    // Vurgu rengi
    accent:                  "var(--accent)",
    accentForeground:        "var(--accent-foreground)",

    // Durum renkleri
    destructive:             "var(--destructive)",
    destructiveForeground:   "var(--destructive-foreground)",
    success:                 "var(--success)",
    successForeground:       "var(--success-foreground)",
    warning:                 "var(--warning)",
    warningForeground:       "var(--warning-foreground)",

    // Form / Input
    border:                  "var(--border)",
    input:                   "var(--input)",
    ring:                    "var(--ring)",

    // Grafik renkleri (Recharts)
    chart1:                  "var(--chart-1)",
    chart2:                  "var(--chart-2)",
    chart3:                  "var(--chart-3)",
    chart4:                  "var(--chart-4)",
    chart5:                  "var(--chart-5)",

    // Sidebar
    sidebarBackground:       "var(--sidebar-background)",
    sidebarForeground:       "var(--sidebar-foreground)",
    sidebarPrimary:          "var(--sidebar-primary)",
    sidebarPrimaryForeground:"var(--sidebar-primary-foreground)",
    sidebarAccent:           "var(--sidebar-accent)",
    sidebarAccentForeground: "var(--sidebar-accent-foreground)",
    sidebarBorder:           "var(--sidebar-border)",
    sidebarRing:             "var(--sidebar-ring)",
  },
} as const;

export type SemanticTokenKey = keyof typeof semanticTokens.light;
