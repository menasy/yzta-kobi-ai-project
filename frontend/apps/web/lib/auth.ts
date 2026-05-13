import {
  type KnownAuthRole,
  resolveKnownAuthRole,
} from "@repo/domain/auth/access/policy";
import { extractAuthRoleFromToken } from "@repo/domain/auth/utils/jwt";
import { cookies } from "next/headers";

/**
 * Server Component'ler için Auth yardımcıları
 *
 * Cookie'den role claim'i okumak için hafif yardımcılar sağlar.
 * JWT doğrulaması API/Backend seviyesinde yapılır.
 */

export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has("access_token");
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function getAuthRoleFromCookie(): Promise<KnownAuthRole | null> {
  const token = await getAuthCookie();
  return resolveKnownAuthRole(extractAuthRoleFromToken(token));
}
