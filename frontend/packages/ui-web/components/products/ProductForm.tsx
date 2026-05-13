"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ProductCreateSchema,
  type ProductCreateFormValues,
} from "@repo/domain/products";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/form";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import { Textarea } from "../shadcn/textarea";
import { Loader2, Tag, Hash, DollarSign, Layers, AlignLeft, Image as ImageIcon } from "lucide-react";
import { cn } from "@repo/core";

interface ProductFormProps {
  defaultValues?: Partial<ProductCreateFormValues>;
  onSubmit: (data: ProductCreateFormValues) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Kaydet",
}: ProductFormProps) {
  const form = useForm<ProductCreateFormValues>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      sku: defaultValues?.sku || "",
      price: defaultValues?.price || 0,
      category: defaultValues?.category || "",
      description: defaultValues?.description || "",
      image_url: defaultValues?.image_url || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Ürün Adı *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ürün adı girin" 
                    className="h-10 bg-background/50 border-primary/5 focus:border-primary/20 text-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> Stok Kodu (SKU) *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Örn: PRD-001" 
                    className="h-10 bg-background/50 border-primary/5 focus:border-primary/20 text-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3" /> Fiyat (TL) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-10 bg-background/50 border-primary/5 focus:border-primary/20 text-sm"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                  <Layers className="h-3 w-3" /> Kategori
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Kategori seçin veya girin" 
                    className="h-10 bg-background/50 border-primary/5 focus:border-primary/20 text-sm"
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                <AlignLeft className="h-3 w-3" /> Açıklama
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ürün hakkında detaylı bilgi..."
                  className="resize-none min-h-[100px] bg-background/50 border-primary/5 focus:border-primary/20 text-sm"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" /> Görsel URL
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  className="h-10 bg-background/50 border-primary/5 focus:border-primary/20 text-sm"
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription className="text-[10px] text-muted-foreground/50 italic">
                Ürün için geçerli bir resim adresi (URL) girin.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-8 h-10 transition-all active:scale-95 font-bold text-xs rounded-xl"
          >
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
