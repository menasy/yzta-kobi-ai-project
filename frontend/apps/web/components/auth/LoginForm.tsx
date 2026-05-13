"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  resolveAuthRedirectPath,
  useLogin,
  type LoginFormValues,
} from "@repo/domain/auth";
import { useApiMessageActions } from "@repo/state";
import { useAuthActions } from "@repo/state/stores/auth";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearAuth, setSessionLoading } = useAuthActions();
  const { showApiError, showApiSuccess } = useApiMessageActions();
  const { error, isPending, login } = useLogin({
    onSuccess: (response) => {
      showApiSuccess(response, "Giriş Başarılı");
      const redirectPath = resolveAuthRedirectPath(searchParams.get("from"));
      router.replace(redirectPath);
      router.refresh();
    },
    onError: (loginError) => {
      showApiError(
        loginError,
        "Giriş Başarısız",
        "Giriş işlemi sırasında bir hata oluştu.",
      );
      clearAuth();
    },
    onSettled: () => {
      setSessionLoading(false);
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    setSessionLoading(true);
    login({
      email: data.email,
      password: data.password,
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
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-bold text-foreground/80">E-posta</FormLabel>
              <FormControl>
                <Input
                  placeholder="ornek@sirket.com"
                  autoComplete="email"
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    className="h-12 pr-12 border-border/60 bg-background/50 text-base transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-all duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
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
              Giriş Yapılıyor...
            </>
          ) : (
            "Giriş Yap"
          )}
        </Button>
      </form>
    </Form>
  );
}
