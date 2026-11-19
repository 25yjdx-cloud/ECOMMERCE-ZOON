import { NextResponse } from "next/server";
import { AUTH_COOKIE, getBackendAuthUrl, isAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code || !/^[A-Za-z0-9]{64}$/.test(code)) {
    return NextResponse.redirect(new URL("/login?notice=oauth-failed", request.url));
  }

  const response = await fetch(getBackendAuthUrl("api/v1/auth/google/exchange"), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.redirect(new URL("/login?notice=oauth-failed", request.url));

  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== "object" ||
    !("token" in payload) ||
    typeof payload.token !== "string" ||
    !("user" in payload) ||
    !isAuthUser(payload.user)
  ) {
    throw new Error("Bagisto returned an invalid Google authentication response.");
  }

  const result = NextResponse.redirect(new URL("/login?oauth=success", request.url));
  result.cookies.set(AUTH_COOKIE, payload.token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return result;
}
