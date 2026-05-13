"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Phone, User, Home, Globe, Hash, StickyNote } from "lucide-react";
import { useShowSuccess, useShowError } from "@repo/state/stores";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/form";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import { Textarea } from "../shadcn/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../shadcn/card";

import {
  useUserAddress,
  useUpsertUserAddress,
  userAddressSchema,
  type UserAddressFormValues,
} from "@repo/domain/user";

export function AddressForm() {
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  const { data: addressResponse, isLoading } = useUserAddress();
  const { mutateAsync: upsertAddress, isPending } = useUpsertUserAddress();

  const form = useForm<UserAddressFormValues>({
    resolver: zodResolver(userAddressSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      postal_code: "",
      country: "Türkiye",
      note: "",
    },
  });

  useEffect(() => {
    if (addressResponse?.data) {
      form.reset({
        full_name: addressResponse.data.full_name || "",
        phone: addressResponse.data.phone || "",
        address: addressResponse.data.address || "",
        city: addressResponse.data.city || "",
        district: addressResponse.data.district || "",
        postal_code: addressResponse.data.postal_code || "",
        country: addressResponse.data.country || "Türkiye",
        note: addressResponse.data.note || "",
      });
    }
  }, [addressResponse, form]);

  const onSubmit = async (data: UserAddressFormValues) => {
    try {
      await upsertAddress(data);
      showSuccess("Başarılı", "Teslimat adresi başarıyla kaydedildi.");
    } catch (error: any) {
      showError("Hata", error.message || "Adres kaydedilirken bir hata oluştu.");
    }
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg overflow-hidden bg-card/60 backdrop-blur-md transition-all hover:shadow-xl h-full flex flex-col">
      <CardHeader className="bg-primary/5 py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Teslimat Adresi</CardTitle>
            <CardDescription className="text-xs">
              Varsayılan teslimat konumunu belirleyin.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-6 pb-6 flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Alıcı Ad Soyad
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ad Soyad" 
                        className="bg-background/40 border-primary/10 focus:border-primary/30 h-10 text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Telefon Numarası
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="05XX XXX XX XX" 
                        className="bg-background/40 border-primary/10 focus:border-primary/30 h-10 text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                    <Home className="h-3 w-3" /> Açık Adres
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mahalle, Sokak, No, Daire..."
                      className="bg-background/40 border-primary/10 focus:border-primary/30 resize-none min-h-[80px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 space-y-1.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      İl
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Şehir" 
                        className="bg-background/40 border-primary/10 focus:border-primary/30 h-10 text-sm px-3"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 space-y-1.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      İlçe
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="İlçe" 
                        className="bg-background/40 border-primary/10 focus:border-primary/30 h-10 text-sm px-3"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 space-y-1.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> Posta Kodu
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="34XXX" 
                        className="bg-background/40 border-primary/10 focus:border-primary/30 h-10 text-sm px-3"
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
                name="country"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 space-y-1.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                      <Globe className="h-3 w-3" /> Ülke
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Türkiye" 
                        className="bg-background/40 border-primary/10 focus:border-primary/30 h-10 text-sm px-3"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                    <StickyNote className="h-3 w-3" /> Teslimat Notu
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kurye için ek notlar..."
                      className="bg-background/40 border-primary/10 focus:border-primary/30 resize-none h-20 text-sm"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-10 h-10 transition-all active:scale-95 font-bold text-xs rounded-xl"
              >
                {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Adresi Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
