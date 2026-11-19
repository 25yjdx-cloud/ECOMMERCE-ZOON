import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

export async function POST(request: Request) {
  let response: Response;

  try {
    response = await fetch(getBackendAuthUrl("api/v1/ai/assist"), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json({ message: "The advisor service is temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
