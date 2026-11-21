import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ accepted: false }, { status: 403 });
  const token = await getAuthToken();
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(getBackendAuthUrl("api/v1/telemetry/heartbeat"), {
      method: "POST",
      headers,
      body: await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    return NextResponse.json({ accepted: response.ok }, { status: response.status });
  } catch {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }
}
