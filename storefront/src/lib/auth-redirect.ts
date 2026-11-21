import type { AuthUser } from "@/lib/auth";

export function getPostLoginPath(user: Pick<AuthUser, "role" | "storeSlug">): string {
  if (user.role === "super_admin") return "/manager";
  return user.storeSlug ? "/dashboard/my-store" : "/launch";
}
