import type { AiPageContext } from "../types/ai-actions.types";

import { getAiPageLabel } from "./get-ai-page-label";

export function buildAiContextPrompt(
  prompt: string,
  pageContext: AiPageContext | null,
): string {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt || !pageContext) {
    return normalizedPrompt;
  }

  const contextFragments = [`Şu anda ${getAiPageLabel(pageContext.page)} sayfasındayım.`];

  if (pageContext.selectedProductId) {
    contextFragments.push(`Seçili ürün ID: ${pageContext.selectedProductId}.`);
  }

  if (pageContext.selectedOrderId) {
    contextFragments.push(`Seçili sipariş ID: ${pageContext.selectedOrderId}.`);
  }

  if (pageContext.selectedTrackingNumber) {
    contextFragments.push(
      `Seçili takip numarası: ${pageContext.selectedTrackingNumber}.`,
    );
  }

  return `${contextFragments.join(" ")} ${normalizedPrompt}`;
}
