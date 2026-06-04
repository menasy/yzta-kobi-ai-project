"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@repo/core";
import { useCreateOrder } from "@repo/domain/orders";
import { useUserAddress } from "@repo/domain/user";
import type { Product } from "@repo/domain/products";
import type { OrderShipping } from "@repo/domain/orders";
import { useUser } from "@repo/state/stores";
import { useApiMessageActions } from "@repo/state/stores";
import { formatCurrency } from "@repo/core";
import { Package, Loader2, MapPin, User, Phone, FileText, ChevronRight, Minus, Plus } from "lucide-react";
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

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";
  if (numbers.length <= 4) {
    return numbers;
  }
  if (numbers.length <= 7) {
    return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
  }
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
  }
  return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
};

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

  const { data: addressData } = useUserAddress();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [shippingForm, setShippingForm] = useState<ShippingFormState>({
    full_name: user?.full_name ?? "",
    phone: "",
    address: "",
    city: "",
    district: "",
  });
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
      full_name: addressData?.data?.full_name || user?.full_name || "",
      phone: addressData?.data?.phone ? formatPhoneNumber(addressData.data.phone) : "",
      address: addressData?.data?.address || "",
      city: addressData?.data?.city || "",
      district: addressData?.data?.district || "",
    });
    setFormErrors({});
    reset();
  }, [user?.full_name, addressData, reset]);

  // Set the address when loaded or sheet opens
  useEffect(() => {
    if (open && addressData?.data) {
      setShippingForm({
        full_name: addressData.data.full_name || user?.full_name || "",
        phone: addressData.data.phone ? formatPhoneNumber(addressData.data.phone) : "",
        address: addressData.data.address || "",
        city: addressData.data.city || "",
        district: addressData.data.district || "",
      });
    }
  }, [open, addressData, user?.full_name]);

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
      let formattedValue = value;
      if (field === "phone") {
        formattedValue = formatPhoneNumber(value);
      }
      setShippingForm((prev) => ({ ...prev, [field]: formattedValue }));
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
        <SheetHeader className="p-5 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Package className="h-5 w-5 text-primary" />
            Yeni Sipariş Oluştur
          </SheetTitle>
          <SheetDescription className="text-sm">
            Ürün detaylarını kontrol edin ve teslimat adresini belirleyin.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Summary */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Ürün Özeti
            </h4>
            <div className="rounded-xl border border-border bg-muted/20 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                {/* Left side: Image and details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/30 border border-border/50 shadow-sm">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg leading-tight truncate text-foreground">{product.name}</h4>
                    <p className="mt-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">{product.sku}</p>
                    <p className="mt-2 text-xl font-extrabold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>

                {/* Right side: Quantity Selector */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 pl-4 border-l border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">Adet</span>
                  <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-sm select-none text-foreground">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity((prev) => Math.min(100, prev + 1))}
                      disabled={quantity >= 100 || isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Shipping Form */}
          <section className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Teslimat Bilgileri
            </h4>

            <div className="grid gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="shipping-fullname" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <User className="h-4 w-4 text-primary/70" />
                  Alıcı Ad Soyad
                </Label>
                <Input
                  id="shipping-fullname"
                  placeholder="Ad Soyad"
                  value={shippingForm.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className={cn("h-11 rounded-xl border-border focus:ring-primary/20", formErrors.full_name && "border-destructive")}
                  disabled={isPending}
                />
                {formErrors.full_name && (
                  <p className="text-xs font-medium text-destructive mt-1">{formErrors.full_name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="shipping-phone" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <Phone className="h-4 w-4 text-primary/70" />
                  Telefon Numarası
                </Label>
                <Input
                  id="shipping-phone"
                  placeholder="05XX XXX XX XX"
                  value={shippingForm.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={cn("h-11 rounded-xl border-border focus:ring-primary/20", formErrors.phone && "border-destructive")}
                  disabled={isPending}
                />
                {formErrors.phone && (
                  <p className="text-xs font-medium text-destructive mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* City & District */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-city" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    Şehir
                  </Label>
                  <Input
                    id="shipping-city"
                    placeholder="İstanbul"
                    value={shippingForm.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={cn("h-11 rounded-xl border-border focus:ring-primary/20", formErrors.city && "border-destructive")}
                    disabled={isPending}
                  />
                  {formErrors.city && (
                    <p className="text-xs font-medium text-destructive mt-1">{formErrors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-district" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    İlçe
                  </Label>
                  <Input
                    id="shipping-district"
                    placeholder="Kadıköy"
                    value={shippingForm.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className={cn("h-11 rounded-xl border-border focus:ring-primary/20", formErrors.district && "border-destructive")}
                    disabled={isPending}
                  />
                  {formErrors.district && (
                    <p className="text-xs font-medium text-destructive mt-1">{formErrors.district}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="shipping-address" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  Açık Adres
                </Label>
                <Textarea
                  id="shipping-address"
                  placeholder="Mahalle, sokak, bina no, daire no..."
                  value={shippingForm.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={cn(
                    "min-h-[80px] rounded-xl border-border focus:ring-primary/20 resize-none",
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
                  className="min-h-[60px] rounded-xl border-border/50 focus:ring-primary/20 resize-none"
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
