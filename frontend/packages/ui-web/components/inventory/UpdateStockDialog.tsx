"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { InventoryItem } from "@repo/domain/inventory/types/inventory.types";
import { useUpdateStock } from "@repo/domain/inventory/hooks/useUpdateStock";
import { useApiMessageActions } from "@repo/state/stores/message/hooks";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
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

const updateStockSchema = z.object({
  quantity: z.coerce.number().min(0, { message: "Stok miktarı 0'dan küçük olamaz." }),
  low_stock_threshold: z.coerce.number().min(0, { message: "Eşik değeri 0'dan küçük olamaz." }),
});

type UpdateStockFormValues = z.infer<typeof updateStockSchema>;

interface UpdateStockDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStockDialog({
  item,
  open,
  onOpenChange,
}: UpdateStockDialogProps) {
  const { updateStockAsync, isPending } = useUpdateStock();
  const { showApiSuccess, showApiError } = useApiMessageActions();

  const form = useForm<UpdateStockFormValues>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      quantity: 0,
      low_stock_threshold: 0,
    },
  });

  // Reset form when item changes
  React.useEffect(() => {
    if (item && open) {
      form.reset({
        quantity: item.quantity,
        low_stock_threshold: item.low_stock_threshold,
      });
    }
  }, [item, open, form]);

  const onSubmit = async (values: UpdateStockFormValues) => {
    if (!item) return;

    try {
      const response = await updateStockAsync({
        productId: item.product_id,
        data: {
          quantity: values.quantity,
          low_stock_threshold: values.low_stock_threshold,
        },
      });
      showApiSuccess(response, "Stok Güncellendi");
      onOpenChange(false);
    } catch (error) {
      showApiError(error, "Güncelleme Başarısız");
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stok Güncelle</DialogTitle>
          <DialogDescription>
            <strong>{item.product_name}</strong> ({item.product_sku}) için stok ve eşik değerlerini güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toplam Stok Miktarı</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Bu değer rezerve edilmiş stokları da içerir.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="low_stock_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kritik Stok Eşiği</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stok bu değerin altına düştüğünde uyarı verilir.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
