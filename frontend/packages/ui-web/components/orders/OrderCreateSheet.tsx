"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@repo/core";
import { useCreateOrder } from "@repo/domain/orders";
import type { Product } from "@repo/domain/products";
import type { OrderShipping } from "@repo/domain/orders";
import { useUser } from "@repo/state/stores";
import { useApiMessageActions } from "@repo/state/stores";
import { formatCurrency } from "@repo/core";
import { Package, Loader2, MapPin, User, Phone, FileText, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@repo/state/query";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../shadcn/sheet";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { Textarea } from "../shadcn/textarea";
import { Separator } from "../shadcn/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";

interface OrderCreateSheetProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

interface ShippingFormState {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
}

function validateShippingForm(form: ShippingFormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.full_name.trim()) {
    errors.full_name = "Ad Soyad zorunludur";
  }
  if (!form.phone.trim()) {
    errors.phone = "Telefon numarası zorunludur";
  } else if (!/^0\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
    errors.phone = "Geçerli bir telefon numarası giriniz (05xxxxxxxxx)";
  }
  if (!form.address.trim()) {
    errors.address = "Adres zorunludur";
  }
  if (!form.city.trim()) {
    errors.city = "Şehir zorunludur";
  }
  if (!form.district.trim()) {
    errors.district = "İlçe zorunludur";
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function OrderCreateSheet({
  product,
  open,
  onOpenChange,
}: OrderCreateSheetProps) {
  const router = useRouter();
  const user = useUser();
  const { showApiSuccess, showApiError } = useApiMessageActions();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [shippingForm, setShippingForm] = useState<ShippingFormState>(() => ({
    full_name: user?.full_name ?? "",
    phone: "",
    address: "",
    city: "",
    district: "",
  }));
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { createOrder, isPending, reset } = useCreateOrder({
    onSuccess: (data) => {
      showApiSuccess(data, "Sipariş Oluşturuldu");
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      onOpenChange(false);
      resetFormState();
      router.push("/orders/my");
    },
    onError: (error) => {
      showApiError(error, "Sipariş Hatası");
    },
  });

  const resetFormState = useCallback(() => {
    setQuantity(1);
    setNotes("");
    setShippingForm({
      full_name: user?.full_name ?? "",
      phone: "",
      address: "",
      city: "",
      district: "",
    });
    setFormErrors({});
    reset();
  }, [user?.full_name, reset]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isPending) return;
      if (!nextOpen) {
        resetFormState();
      }
      onOpenChange(nextOpen);
    },
    [isPending, onOpenChange, resetFormState],
  );

  const updateField = useCallback(
    (field: keyof ShippingFormState, value: string) => {
      setShippingForm((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const errors = validateShippingForm(shippingForm);
    if (hasErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    const shipping: OrderShipping = {
      full_name: shippingForm.full_name.trim(),
      phone: shippingForm.phone.replace(/\s/g, "").trim(),
      address: shippingForm.address.trim(),
      city: shippingForm.city.trim(),
      district: shippingForm.district.trim(),
    };

    createOrder({
      items: [{ product_id: product.id, quantity }],
      shipping,
      notes: notes.trim() || null,
    });
  }, [shippingForm, quantity, notes, product.id, createOrder]);

  const totalPrice = product.price * quantity;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Package className="h-5 w-5 text-primary" />
            Yeni Sipariş Oluştur
          </SheetTitle>
          <SheetDescription>
            Ürün detaylarını kontrol edin ve teslimat adresini belirleyin.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Product Summary */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ürün Özeti
            </h4>
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/30 border border-border/30">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg leading-tight truncate">{product.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">{product.sku}</p>
                  <p className="mt-2 text-xl font-black text-primary">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-quantity" className="text-sm font-semibold">Adet Seçimi</Label>
              <Select
                value={String(quantity)}
                onValueChange={(val) => setQuantity(Number(val))}
              >
                <SelectTrigger id="order-quantity" className="h-12 w-full rounded-xl border-border/50">
                  <SelectValue placeholder="Adet seçin" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {QUANTITY_OPTIONS.map((qty) => (
                    <SelectItem key={qty} value={String(qty)} className="rounded-lg">
                      {qty} Adet
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Shipping Form */}
          <section className="space-y-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Teslimat Bilgileri
            </h4>

            <div className="grid gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="shipping-fullname" className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary/70" />
                  Alıcı Ad Soyad
                </Label>
                <Input
                  id="shipping-fullname"
                  placeholder="Ad Soyad"
                  value={shippingForm.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className={cn("h-11 rounded-xl border-border/50 focus:ring-primary/20", formErrors.full_name && "border-destructive")}
                  disabled={isPending}
                />
                {formErrors.full_name && (
                  <p className="text-xs font-medium text-destructive mt-1">{formErrors.full_name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="shipping-phone" className="text-sm font-semibold flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-primary/70" />
                  Telefon Numarası
                </Label>
                <Input
                  id="shipping-phone"
                  placeholder="05XX XXX XX XX"
                  value={shippingForm.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={cn("h-11 rounded-xl border-border/50 focus:ring-primary/20", formErrors.phone && "border-destructive")}
                  disabled={isPending}
                />
                {formErrors.phone && (
                  <p className="text-xs font-medium text-destructive mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* City & District */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-city" className="text-sm font-semibold">Şehir</Label>
                  <Input
                    id="shipping-city"
                    placeholder="İstanbul"
                    value={shippingForm.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={cn("h-11 rounded-xl border-border/50 focus:ring-primary/20", formErrors.city && "border-destructive")}
                    disabled={isPending}
                  />
                  {formErrors.city && (
                    <p className="text-xs font-medium text-destructive mt-1">{formErrors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-district" className="text-sm font-semibold">İlçe</Label>
                  <Input
                    id="shipping-district"
                    placeholder="Kadıköy"
                    value={shippingForm.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className={cn("h-11 rounded-xl border-border/50 focus:ring-primary/20", formErrors.district && "border-destructive")}
                    disabled={isPending}
                  />
                  {formErrors.district && (
                    <p className="text-xs font-medium text-destructive mt-1">{formErrors.district}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="shipping-address" className="text-sm font-semibold">Açık Adres</Label>
                <Textarea
                  id="shipping-address"
                  placeholder="Mahalle, sokak, bina no, daire no..."
                  value={shippingForm.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={cn(
                    "min-h-[100px] rounded-xl border-border/50 focus:ring-primary/20 resize-none",
                    formErrors.address && "border-destructive",
                  )}
                  disabled={isPending}
                />
                {formErrors.address && (
                  <p className="text-xs font-medium text-destructive mt-1">{formErrors.address}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="shipping-notes" className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary/70" />
                  Sipariş Notu <span className="text-xs font-normal text-muted-foreground ml-auto">(Opsiyonel)</span>
                </Label>
                <Textarea
                  id="shipping-notes"
                  placeholder="Özel talepleriniz..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] rounded-xl border-border/50 focus:ring-primary/20 resize-none"
                  disabled={isPending}
                />
              </div>
            </div>
          </section>
        </div>

        <SheetFooter className="p-6 border-t bg-background flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-primary/5 border border-primary/10 h-14">
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 leading-none mb-1">Ödenecek Tutar</span>
              <span className="text-xs font-medium text-muted-foreground leading-none">{quantity} Ürün</span>
            </div>
            <span className="text-xl font-black text-primary tracking-tight">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          
          <div className="flex gap-3 h-14 sm:w-auto w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="h-full px-6 rounded-xl font-semibold hover:bg-destructive/5 hover:text-destructive flex-1 sm:flex-none"
            >
              Vazgeç
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="h-full px-8 rounded-xl font-bold shadow-lg shadow-primary/20 group flex-[2] sm:flex-none sm:min-w-[180px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Oluşturuluyor
                </>
              ) : (
                <>
                  Onayla ve Oluştur
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
