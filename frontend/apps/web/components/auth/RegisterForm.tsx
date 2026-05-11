"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  useRegister,
  type RegisterFormValues,
} from "@repo/domain/auth";
import { useApiMessageActions } from "@repo/state";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@repo/ui-web";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function RegisterForm() {
  const router = useRouter();
  const { showApiError, showApiSuccess } = useApiMessageActions();
  const { error, isPending, register } = useRegister({
    onSuccess: (response) => {
      showApiSuccess(response, "Kayıt Başarılı");
      router.replace("/auth/login");
    },
    onError: (registerError) => {
      showApiError(
        registerError,
        "Kayıt Başarısız",
        "Kayıt işlemi sırasında bir hata oluştu.",
      );
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: RegisterFormValues) {
    register({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-bold text-foreground/80">Ad Soyad</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ahmet Yılmaz"
                  disabled={isPending}
                  className="h-12 border-border/60 bg-background/50 text-base transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-medium" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-bold text-foreground/80">E-posta</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="ahmet@sirket.com"
                  disabled={isPending}
                  className="h-12 border-border/60 bg-background/50 text-base transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-medium" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-bold text-foreground/80">Şifre</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  className="h-12 border-border/60 bg-background/50 text-base transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-medium" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-bold text-foreground/80">Şifre Tekrar</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  className="h-12 border-border/60 bg-background/50 text-base transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-medium" />
            </FormItem>
          )}
        />
        {error ? (
          <p className="text-sm font-medium text-destructive">{error.message}</p>
        ) : null}
        <Button
          type="submit"
          className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Hesap Oluşturuluyor...
            </>
          ) : (
            "Kayıt Ol"
          )}
        </Button>
      </form>
    </Form>
  );
}
