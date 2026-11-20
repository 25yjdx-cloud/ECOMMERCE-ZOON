import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

export async function GET(request: Request) {
  const url = getBackendAuthUrl("api/v1/notifications");
  url.searchParams.set("lang", new URL(request.url).searchParams.get("lang") ?? "ar");
  const token = await getAuthToken();
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", "Bearer " + token);

  let response: Response;
  try {
    response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(8000) });
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json({ message: "Notifications are temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return NextResponse.json({ message: "Invalid notification request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ message: "Invalid notification request." }, { status: 400 });
  }

  const record = payload as Record<string, unknown>;
  const path = record.all === true
    ? "api/v1/notifications/read-all"
    : typeof record.id === "number" && Number.isSafeInteger(record.id) && record.id > 0
      ? `api/v1/notifications/${record.id}/read`
      : null;
  if (!path) {
    return NextResponse.json({ message: "Invalid notification request." }, { status: 400 });
  }

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });

  let response: Response;
  try {
    response = await fetch(getBackendAuthUrl(path), {
      method: "POST",
      headers: { Accept: "application/json", Authorization: "Bearer " + token },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json({ message: "Notifications are temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
