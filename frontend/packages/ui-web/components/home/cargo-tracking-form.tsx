"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  cargoTrackingSchema,
  type CargoTrackingInput,
  useCargoTracking,
} from "@repo/domain/customer";
import { useApiMessageActions } from "@repo/state/stores";
import { Loader2, Search, Truck } from "lucide-react";
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

export function CargoTrackingForm() {
  const { showApiSuccess, showApiError } = useApiMessageActions();
  const form = useForm<CargoTrackingInput>({
    resolver: zodResolver(cargoTrackingSchema),
    defaultValues: { trackingNumber: "" },
  });

  const { trackCargoAsync, isPending, data, error, reset } = useCargoTracking({
    onSuccess: (response) => showApiSuccess(response, "Kargo bilgisi hazır"),
    onError: (apiError) => showApiError(apiError, "Kargo takip edilemedi"),
  });

  const result = data?.data ?? null;

  const onSubmit = async (values: CargoTrackingInput) => {
    try {
      await trackCargoAsync(values);
    } catch {
      // Error state and message are handled by TanStack Query onError.
    }
  };

  const handleReset = () => {
    form.reset({ trackingNumber: "" });
    reset();
  };

  if (result) {
    return (
      <div className="space-y-6">
        <CustomerResultCard
          title="Kargo Durumu"
          status={result.status === "Teslim Edildi" ? "success" : "warning"}
          statusText={result.status}
          items={[
            { label: "Takip Numarası", value: result.trackingNumber },
            { label: "Kargo Firması", value: result.company },
            { label: "Tahmini Teslimat", value: result.estimatedDelivery },
            { label: "Son İşlem", value: result.lastUpdate },
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
          name="trackingNumber"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium text-foreground/80">
                Takip Numarası
              </FormLabel>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Truck className="size-5" />
                </div>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Örn: 1A2B3C4D5E"
                    className="h-14 pl-11 pr-4 text-lg border-border/60 bg-background/50 transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription className="pl-1 text-xs">
                Kargo firmanızın verdiği takip numarasını giriniz.
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
            Takip sonucu burada görünecek.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Search className="mr-2 size-5" />}
          Takip Et
        </Button>
      </form>
    </Form>
  );
}
