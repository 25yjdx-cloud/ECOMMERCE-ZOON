import type { AuthUser } from "@/lib/auth";

export function getPostLoginPath(user: Pick<AuthUser, "role" | "storeSlug" | "memberRole">): string {
  if (user.role === "super_admin") return "/manager";
  if (user.memberRole === "staff" || user.memberRole === "order_manager") return "/dashboard/orders";
  return user.storeSlug ? "/dashboard/my-store" : "/launch";
}
