import { NextResponse } from "next/server";
import { AUTH_COOKIE, getAuthToken, getBackendAuthUrl } from "@/lib/auth";

export async function POST() {
  const token = await getAuthToken();

  if (token) {
    const response = await fetch(getBackendAuthUrl("api/v1/auth/logout"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok && response.status !== 401) {
      return NextResponse.json(
        { message: "تعذر إكمال تسجيل الخروج من الخادم." },
        { status: response.status },
      );
    }
  }

  const result = NextResponse.json({ ok: true });
  result.cookies.delete(AUTH_COOKIE);
  return result;
}
