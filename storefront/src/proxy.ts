import { NextResponse, type NextRequest } from "next/server";

const sensitivePath = /^\/(?:\.env(?:\..*)?|\.git(?:\/.*)?|backups(?:\/.*)?|.*\.(?:sql|bak)|composer\.json)(?:\/|$)/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (sensitivePath.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const protectedPage = pathname === "/launch"
    || pathname.startsWith("/launch/")
    || pathname === "/dashboard/my-store"
    || pathname.startsWith("/dashboard/my-store/")
    || pathname === "/dashboard/orders"
    || pathname.startsWith("/dashboard/orders/")
    || pathname.startsWith("/manager")
    || pathname.startsWith("/admin");

  if (protectedPage) {
    const token = request.cookies.get("commerceforge_auth")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/manager") || pathname.startsWith("/admin")) {
      const backendBaseUrl = process.env.BACKEND_URL || process.env.BAGISTO_API_URL || "http://127.0.0.1:8001";
      const backendUrl = new URL("api/v1/auth/me", backendBaseUrl.endsWith("/") ? backendBaseUrl : `${backendBaseUrl}/`);
      try {
        const response = await fetch(backendUrl, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: AbortSignal.timeout(3500),
        });
        const payload: unknown = response.ok ? await response.json() : null;
        const role = payload && typeof payload === "object" && "user" in payload
          && payload.user && typeof payload.user === "object" && "role" in payload.user
          ? payload.user.role
          : null;
        if (role !== "super_admin") return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        return new NextResponse("Manager access verification is temporarily unavailable.", { status: 503 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/launch",
    "/launch/:path*",
    "/dashboard/my-store",
    "/dashboard/my-store/:path*",
    "/dashboard/orders",
    "/dashboard/orders/:path*",
    "/manager",
    "/manager/:path*",
    "/admin",
    "/admin/:path*",
    "/.env",
    "/.env/:path*",
    "/.git/:path*",
    "/backups/:path*",
    "/:path*.sql",
    "/:path*.bak",
    "/composer.json",
  ],
};
