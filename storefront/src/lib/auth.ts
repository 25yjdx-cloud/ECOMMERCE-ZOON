import { cookies } from "next/headers";

export const AUTH_COOKIE = "commerceforge_auth";

export type AuthRole = "super_admin" | "merchant";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  storeSlug: string | null;
  whatsappPhone?: string | null;
  market?: "EG" | "SA" | null;
  twoFactorEnabled?: boolean;
};

export function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    (user.role === "super_admin" || user.role === "merchant") &&
    (user.storeSlug === null || typeof user.storeSlug === "string") &&
    (user.whatsappPhone === undefined || user.whatsappPhone === null || typeof user.whatsappPhone === "string") &&
    (user.market === undefined || user.market === null || user.market === "EG" || user.market === "SA") &&
    (user.twoFactorEnabled === undefined || typeof user.twoFactorEnabled === "boolean")
  );
}

export function getBackendAuthUrl(path: string): URL {
  const apiUrl = process.env.BAGISTO_API_URL;
  if (!apiUrl) throw new Error("BAGISTO_API_URL is required for authentication.");

  return new URL(path, apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`);
}

export async function getAuthToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return false;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const response = await fetch(getBackendAuthUrl("api/v1/auth/me"), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`Bagisto authentication check failed (${response.status}).`);

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("user" in payload) || !isAuthUser(payload.user)) {
    throw new Error("Bagisto returned an invalid authentication profile.");
  }

  return payload.user;
}

export function safeInternalRedirect(value: string | null, fallback: string): string {
  return value?.startsWith("/")
    && !value.startsWith("//")
    && !value.startsWith("/\\")
    && !value.includes("\\")
    && !/[\u0000-\u001f]/.test(value)
    ? value
    : fallback;
}
