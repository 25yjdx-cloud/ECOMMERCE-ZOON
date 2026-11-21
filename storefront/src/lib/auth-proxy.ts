import { NextResponse } from "next/server";
import { AUTH_COOKIE, getBackendAuthUrl, hasSameOrigin, isAuthUser } from "./auth";

export async function proxyAuth(
  request: Request,
  endpoint: "login" | "register" | "firebase" | "firebase-google",
): Promise<NextResponse> {
  if ((endpoint === "firebase" || endpoint === "firebase-google") && !hasSameOrigin(request)) {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 403 });
  }

  let response: Response;
  try {
    response = await fetch(getBackendAuthUrl(`api/v1/auth/${endpoint}`), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { message: timedOut ? "انتهت مهلة الاتصال بخادم تسجيل الدخول." : "تعذر الاتصال بخادم تسجيل الدخول." },
      { status: timedOut ? 504 : 502 },
    );
  }
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
    maxAge: 60 * 60 * 2,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return result;
}
