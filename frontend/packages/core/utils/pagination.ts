/**
 * Sayfalama hesaplama yardımcıları
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Sayfalama meta bilgilerini hesaplar
 */
export function calculatePagination(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Sayfa aralığını hesaplar (pagination bar için)
 * @example getPageRange(3, 10) → [1, 2, 3, 4, 5, "...", 10]
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  delta = 2,
): (number | "...")[] {
  const range: number[] = [];

  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  const result: (number | "...")[] = [];

  if (range[0] && range[0] > 1) {
    result.push(1);
    if (range[0] > 2) result.push("...");
  }

  result.push(...range);

  const last = range[range.length - 1];
  if (last && last < totalPages) {
    if (last < totalPages - 1) result.push("...");
    result.push(totalPages);
  }

  return result;
}
