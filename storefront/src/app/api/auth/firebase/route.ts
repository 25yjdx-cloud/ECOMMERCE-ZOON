import { NextResponse } from "next/server";
import { AUTH_COOKIE, isAuthUser, hasSameOrigin } from "@/lib/auth";

type FirebaseClaims = {
  aud?: unknown;
  email?: unknown;
  name?: unknown;
  sub?: unknown;
  picture?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function decodeFirebaseClaims(idToken: string): FirebaseClaims | null {
  const parts = idToken.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const claims: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return isRecord(claims) ? claims : null;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 403 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "بيانات تسجيل الدخول غير صالحة." }, { status: 400 });
    }
    throw error;
  }

  const idToken = isRecord(requestBody) && typeof requestBody.idToken === "string"
    ? requestBody.idToken
    : isRecord(requestBody) && typeof requestBody.id_token === "string"
      ? requestBody.id_token
      : null;
  if (!idToken) {
    return NextResponse.json({ message: "رمز Firebase مطلوب." }, { status: 400 });
  }

  const claims = decodeFirebaseClaims(idToken);
  if (
    !claims ||
    claims.aud !== "commerce-forge-c3d86" ||
    typeof claims.email !== "string" ||
    !claims.email.includes("@") ||
    typeof claims.sub !== "string" ||
    claims.sub.length === 0
  ) {
    return NextResponse.json({ message: "تعذر التحقق من بيانات حساب Google." }, { status: 401 });
  }

  const email = claims.email.trim().toLowerCase();
  const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  const backendBaseUrl = process.env.BACKEND_URL || process.env.BAGISTO_API_URL || "http://127.0.0.1:8000";
  const backendUrl = new URL("api/v1/auth/firebase", backendBaseUrl.endsWith("/") ? backendBaseUrl : `${backendBaseUrl}/`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  let response: Response;
  let payload: unknown;

  try {
    response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        email,
        name: typeof claims.name === "string" ? claims.name : "",
        uid: claims.sub,
        avatar: typeof claims.picture === "string" ? claims.picture : "",
        ...(typeof requestBody === "object" && requestBody !== null && "whatsapp_phone" in requestBody
          ? { whatsapp_phone: requestBody.whatsapp_phone }
          : {}),
        ...(typeof requestBody === "object" && requestBody !== null && "market" in requestBody
          ? { market: requestBody.market }
          : {}),
        ...(typeof requestBody === "object" && requestBody !== null && "two_factor_code" in requestBody
          ? { two_factor_code: requestBody.two_factor_code }
          : {}),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    payload = await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ message: "انتهت مهلة الاتصال بخادم تسجيل الدخول." }, { status: 504 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "أعاد خادم تسجيل الدخول استجابة غير صالحة." }, { status: 502 });
    }

    if (error instanceof TypeError) {
      return NextResponse.json({ message: "تعذر الاتصال بخادم تسجيل الدخول." }, { status: 502 });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (process.env.NODE_ENV === "development") {
      const reason = isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : response.statusText || "Unknown Laravel error";

      return NextResponse.json(
        { message: reason, backend_status: response.status, backend_reason: reason },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: response.status });
  }

  if (
    !isRecord(payload) ||
    typeof payload.token !== "string" ||
    !isAuthUser(payload.user)
  ) {
    return NextResponse.json({ message: "أعاد خادم تسجيل الدخول بيانات غير صالحة." }, { status: 502 });
  }

  const backendUser = payload.user;
  const isOwner = email === ownerEmail || (ownerEmail === "" && backendUser.role === "super_admin");
  const hasStore = (
    ("has_store" in backendUser && backendUser.has_store === true) ||
    (typeof backendUser.storeSlug === "string" && backendUser.storeSlug.length > 0)
  );
  const redirectTo = isOwner ? "/manager" : hasStore ? "/dashboard/my-store" : "/launch";
  const user = { ...backendUser, isOwner };
  const result = NextResponse.json({ status: "ok", user, redirectTo });
  result.cookies.set(AUTH_COOKIE, payload.token, {
    httpOnly: true,
    maxAge: 60 * 60 * 2,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return result;
}
