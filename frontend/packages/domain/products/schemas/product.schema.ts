import { z } from "zod";

export const ProductCreateSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır."),
  sku: z.string().min(2, "SKU en az 2 karakter olmalıdır."),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  image_url: z.string().url("Geçerli bir URL giriniz.").nullable().optional().or(z.literal("")),
});

export type ProductCreateFormValues = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductUpdateFormValues = z.infer<typeof ProductUpdateSchema>;
