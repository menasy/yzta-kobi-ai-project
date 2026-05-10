import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Ad soyad en az 2 karakter olmalıdır." })
      .max(255, { message: "Ad soyad en fazla 255 karakter olabilir." }),
    email: z
      .string()
      .min(5, { message: "E-posta en az 5 karakter olmalıdır." })
      .max(255, { message: "E-posta en fazla 255 karakter olabilir." })
      .email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z
      .string()
      .min(8, { message: "Şifre en az 8 karakter olmalıdır." })
      .max(128, { message: "Şifre en fazla 128 karakter olabilir." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z
    .string()
    .min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});
