import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

export async function GET() {
  if (!process.env.BAGISTO_API_URL) {
    return NextResponse.json({ connected: false }, { status: 503 });
  }

  let response: Response;

  try {
    response = await fetch(getBackendAuthUrl("api/v1/templates"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json({ connected: false }, { status: 503 });
    }
    throw error;
  }

  if (!response.ok) {
    return NextResponse.json({ connected: false }, { status: 503 });
  }

  const payload: unknown = await response.json();
  const connected =
    payload !== null
    && typeof payload === "object"
    && "data" in payload
    && Array.isArray(payload.data);

  return NextResponse.json({ connected }, { status: connected ? 200 : 503 });
}
