import { NextResponse } from "next/server";
import { AUTH_COOKIE, getBackendAuthUrl, isAuthUser } from "./auth";

export async function proxyAuth(
  request: Request,
  endpoint: "login" | "register" | "firebase-google",
): Promise<NextResponse> {
  const response = await fetch(getBackendAuthUrl(`api/v1/auth/${endpoint}`), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: await request.text(),
    cache: "no-store",
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("token" in payload) ||
    !("user" in payload) ||
    typeof payload.token !== "string" ||
    !isAuthUser(payload.user)
  ) {
    throw new Error("Bagisto returned an invalid login response.");
  }

  const result = NextResponse.json({ user: payload.user });
  result.cookies.set(AUTH_COOKIE, payload.token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return result;
}
