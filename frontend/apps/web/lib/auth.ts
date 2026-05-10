import { cookies } from "next/headers";

/**
 * Server Component'ler için Auth yardımcıları
 *
 * Sadece cookie varlığını kontrol eder, JWT doğrulaması yapmaz.
 * Doğrulama API/Backend seviyesinde yapılır.
 */

export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has("access_token");
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}
