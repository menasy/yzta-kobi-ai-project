"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, ShieldCheck } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../shadcn/card";
import { Separator } from "../shadcn/separator";
import { Badge } from "../shadcn/badge";

import {
  useUserProfile,
  useUpdateUserProfile,
  userProfileSchema,
  type UserProfileFormValues,
} from "@repo/domain/user";

export function ProfileForm() {
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  const { data: profileResponse, isLoading } = useUserProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateUserProfile();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: "",
    },
  });

  useEffect(() => {
    if (profileResponse?.data) {
      form.reset({
        full_name: profileResponse.data.full_name || "",
      });
    }
  }, [profileResponse, form]);

  const onSubmit = async (data: UserProfileFormValues) => {
    try {
      await updateProfile(data);
      showSuccess("Başarılı", "Profil bilgileriniz güncellendi.");
    } catch (error: any) {
      showError("Hata", error.message || "Profil güncellenirken bir hata oluştu.");
    }
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        </CardContent>
      </Card>
    );
  }

  const user = profileResponse?.data;

  return (
    <Card className="border-none shadow-md overflow-hidden bg-card/60 backdrop-blur-md transition-all hover:shadow-lg">
      <CardHeader className="bg-primary/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Profil Bilgileri</CardTitle>
            <CardDescription className="text-sm">
              Hesap bilgilerinizi ve kimlik verilerinizi yönetin.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
              <Mail className="h-3.5 w-3.5" />
              E-posta Adresi
            </div>
            <p className="text-sm font-semibold pl-5 text-foreground/90">{user?.email}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
              <ShieldCheck className="h-3.5 w-3.5" />
              Hesap Rolü
            </div>
            <div className="pl-5">
              <Badge variant="secondary" className="capitalize text-[10px] h-5 bg-primary/10 text-primary border-none">
                {user?.role === 'admin' ? 'Yönetici' : 'Müşteri'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="mb-8 opacity-40" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                    Tam Ad Soyad
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ad Soyad giriniz" 
                      className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all h-11"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 h-11 transition-all active:scale-95 font-semibold"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Güncelle
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
