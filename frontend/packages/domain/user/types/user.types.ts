import type { ApiResponse } from "@repo/core";
import { z } from "zod";

export interface UserProfile extends Record<string, unknown> {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAddress extends Record<string, unknown> {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postal_code: string | null;
  country: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  full_name: string;
}

export interface UserAddressUpsert {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postal_code?: string | null;
  country?: string;
  note?: string | null;
}

export type UserProfileResponse = ApiResponse<UserProfile>;
export type UserAddressResponse = ApiResponse<UserAddress>;

// Zod schemas for forms
export const userProfileSchema = z.object({
  full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır.").max(50, "Ad soyad çok uzun."),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const userAddressSchema = z.object({
  full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
  address: z.string().min(10, "Açık adres giriniz."),
  city: z.string().min(2, "Şehir giriniz."),
  district: z.string().min(2, "İlçe giriniz."),
  postal_code: z.string().optional().nullable(),
  country: z.string().default("Türkiye").optional(),
  note: z.string().optional().nullable(),
});

export type UserAddressFormValues = z.infer<typeof userAddressSchema>;
