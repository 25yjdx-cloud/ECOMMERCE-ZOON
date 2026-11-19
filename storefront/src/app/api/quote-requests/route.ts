import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

export async function POST(request: Request) {
  const response = await fetch(getBackendAuthUrl("api/v1/quote-requests"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: await request.text(),
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
