import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const backendUrl = getBackendAuthUrl("api/v1/auth/google/redirect");
  for (const key of ["mode", "market", "whatsapp_phone"]) {
    const value = incoming.searchParams.get(key);
    if (value) backendUrl.searchParams.set(key, value);
  }
  const response = NextResponse.redirect(backendUrl);
  return response;
}
