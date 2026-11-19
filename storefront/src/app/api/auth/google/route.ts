import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

export async function GET() {
  const response = NextResponse.redirect(getBackendAuthUrl("api/v1/auth/google/redirect"));
  return response;
}
