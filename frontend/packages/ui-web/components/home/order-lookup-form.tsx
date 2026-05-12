"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  orderLookupSchema,
  type OrderLookupInput,
  useOrderLookup,
} from "@repo/domain/customer";
import { useApiMessageActions } from "@repo/state/stores";
import { Loader2, Package, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "../shadcn/alert";
import { Button } from "../shadcn/button";
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
import { CustomerResultCard } from "./customer-result-card";

export function OrderLookupForm() {
  const { showApiSuccess, showApiError } = useApiMessageActions();
  const form = useForm<OrderLookupInput>({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: { orderNumber: "" },
  });

  const { lookupOrderAsync, isPending, data, error, reset } = useOrderLookup({
    onSuccess: (response) => showApiSuccess(response, "Sipariş bulundu"),
    onError: (apiError) => showApiError(apiError, "Sipariş bulunamadı"),
  });

  const result = data?.data ?? null;

  const onSubmit = async (values: OrderLookupInput) => {
    try {
      await lookupOrderAsync(values);
    } catch {
      // Error state and message are handled by TanStack Query onError.
    }
  };

  const handleReset = () => {
    form.reset({ orderNumber: "" });
    reset();
  };

  if (result) {
    return (
      <div className="space-y-6">
        <CustomerResultCard
          title="Sipariş Detayı"
          status={result.status === "Teslim Edildi" ? "success" : "info"}
          statusText={result.status}
          items={[
            { label: "Sipariş Numarası", value: result.orderNumber },
            { label: "Sipariş Tarihi", value: result.date },
            { label: "Toplam Tutar", value: result.total },
          ]}
        />
        <Button variant="outline" onClick={handleReset} className="w-full">
          Yeni Sorgulama Yap
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="orderNumber"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium text-foreground/80">
                Sipariş Numarası
              </FormLabel>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Package className="size-5" />
                </div>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Örn: ORD-12345"
                    className="h-14 pl-11 pr-4 text-lg border-border/60 bg-background/50 transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription className="pl-1 text-xs">
                Sipariş onay e-postanızda yer alan numarayı giriniz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertDescription className="text-xs">{error.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!error && !form.formState.isSubmitted && (
          <p className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            Sorgulama sonucu burada görünecek.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Search className="mr-2 size-5" />}
          Sorgula
        </Button>
      </form>
    </Form>
  );
}
