import { z } from "zod";

export const orderLookupSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(3, { message: "Sipariş numarası en az 3 karakter olmalıdır." })
    .max(50, { message: "Sipariş numarası en fazla 50 karakter olabilir." }),
});

export const stockQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, { message: "Ürün adı veya SKU en az 2 karakter olmalıdır." })
    .max(100, { message: "Ürün adı veya SKU en fazla 100 karakter olabilir." }),
});

export const cargoTrackingSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .min(5, { message: "Takip numarası en az 5 karakter olmalıdır." })
    .max(100, { message: "Takip numarası en fazla 100 karakter olabilir." }),
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
export type StockQueryInput = z.infer<typeof stockQuerySchema>;
export type CargoTrackingInput = z.infer<typeof cargoTrackingSchema>;
