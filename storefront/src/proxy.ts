import { NextResponse, type NextRequest } from "next/server";

const sensitivePath = /^\/(?:\.env(?:\..*)?|\.git(?:\/.*)?|backups(?:\/.*)?|.*\.(?:sql|bak)|composer\.json)(?:\/|$)/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (sensitivePath.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const protectedPage = pathname === "/launch"
    || pathname.startsWith("/launch/")
    || pathname === "/dashboard/my-store"
    || pathname.startsWith("/dashboard/my-store/")
    || pathname.startsWith("/manager")
    || pathname.startsWith("/admin");

  if (protectedPage) {
    if (!request.cookies.has("commerceforge_auth")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

      return NextResponse.redirect(loginUrl);
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
