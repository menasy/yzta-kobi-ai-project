import type { AiPage, AiQuickAction } from "../types/ai-actions.types";

const QUICK_ACTIONS_BY_PAGE: Record<AiPage, readonly AiQuickAction[]> = {
  dashboard: [
    {
      id: "dashboard-risk-summary",
      label: "Bugünkü riskleri özetle",
      prompt: "Bugünkü operasyon risklerini özetle",
    },
    {
      id: "dashboard-priority-actions",
      label: "Öncelikli aksiyonları çıkar",
      prompt: "Bugün önce hangi aksiyonları yapmalıyım?",
    },
    {
      id: "dashboard-low-risk-actions",
      label: "Düşük riskli aksiyon hazırla",
      prompt: "Düşük riskli aksiyonları hazırla",
    },
  ],
  products: [
    {
      id: "products-dead-stock",
      label: "Ölü stokları bul",
      prompt: "Ölü stok ürünleri bul",
    },
    {
      id: "products-discount-suggestion",
      label: "İndirim önerisi hazırla",
      prompt: "Yavaş satan ürünlere indirim öner",
    },
    {
      id: "products-price-opportunity",
      label: "Fiyat fırsatını analiz et",
      prompt: "Hızlı satan ürünlerde fiyat fırsatı var mı?",
    },
  ],
  orders: [
    {
      id: "orders-priority",
      label: "Öncelikli siparişleri bul",
      prompt: "Öncelikli siparişleri bul",
    },
    {
      id: "orders-pending-analysis",
      label: "Bekleyenleri analiz et",
      prompt: "Bekleyen siparişleri analiz et",
    },
    {
      id: "orders-status-action",
      label: "Durum aksiyonu hazırla",
      prompt: "Durumu güncellenebilecek siparişleri hazırla",
    },
  ],
  inventory: [
    {
      id: "inventory-critical-analysis",
      label: "Kritik stokları analiz et",
      prompt: "Kritik stokları analiz et",
    },
    {
      id: "inventory-threshold-action",
      label: "Eşik aksiyonu hazırla",
      prompt: "Stok eşiklerini güncellemek için öneri hazırla",
    },
    {
      id: "inventory-fast-moving",
      label: "Hızlı tükenenleri bul",
      prompt: "Hızlı tükenen ürünleri bul",
    },
  ],
  shipments: [
    {
      id: "shipments-delayed",
      label: "Gecikenleri bul",
      prompt: "Geciken kargoları bul",
    },
    {
      id: "shipments-refresh-action",
      label: "Yenileme aksiyonu hazırla",
      prompt: "Kargoları yenilemek için aksiyon hazırla",
    },
    {
      id: "shipments-risk-summary",
      label: "Riskli teslimatları özetle",
      prompt: "Riskli teslimatları özetle",
    },
  ],
  notifications: [
    {
      id: "notifications-priority",
      label: "Önem sırasına göre ayır",
      prompt: "Bildirimleri önem sırasına göre ayır",
    },
    {
      id: "notifications-cleanup-action",
      label: "Temizleme aksiyonu hazırla",
      prompt: "Düşük öncelikli bildirimleri temizlemek için aksiyon hazırla",
    },
    {
      id: "notifications-action-list",
      label: "Aksiyon listesini çıkar",
      prompt: "Bugünkü aksiyon listesini çıkar",
    },
  ],
  chat: [],
};

export function getAiQuickActionsForPage(page: AiPage): readonly AiQuickAction[] {
  return QUICK_ACTIONS_BY_PAGE[page];
}
