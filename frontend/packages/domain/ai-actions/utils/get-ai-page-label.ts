import type { AiPage } from "../types/ai-actions.types";

const AI_PAGE_LABELS: Record<AiPage, string> = {
  dashboard: "Dashboard",
  products: "Ürünler",
  orders: "Siparişler",
  inventory: "Envanter",
  shipments: "Kargolar",
  notifications: "Bildirimler",
  chat: "Sohbet",
};

export function getAiPageLabel(page: AiPage): string {
  return AI_PAGE_LABELS[page];
}
