import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

export async function GET() {
  const response = await fetch(getBackendAuthUrl("api/v1/templates"), { headers: { Accept: "application/json" }, cache: "no-store" });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}
