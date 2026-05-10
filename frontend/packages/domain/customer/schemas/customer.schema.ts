import { z } from 'zod';

export const orderLookupSchema = z.object({
  orderNumber: z.string().min(3, { message: 'Sipariş numarası en az 3 karakter olmalıdır.' }),
});

export const stockQuerySchema = z.object({
  query: z.string().min(2, { message: 'Ürün adı veya SKU en az 2 karakter olmalıdır.' }),
});

export const cargoTrackingSchema = z.object({
  trackingNumber: z.string().min(5, { message: 'Takip numarası en az 5 karakter olmalıdır.' }),
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
export type StockQueryInput = z.infer<typeof stockQuerySchema>;
export type CargoTrackingInput = z.infer<typeof cargoTrackingSchema>;
