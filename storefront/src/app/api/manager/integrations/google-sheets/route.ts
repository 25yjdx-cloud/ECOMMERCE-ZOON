import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

async function forward(request: Request, method: "GET" | "PUT" | "POST") {
  if (method !== "GET" && !hasSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const response = await fetch(getBackendAuthUrl("api/v1/admin/integrations/google-sheets"), {
    method,
    headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(method === "GET" ? {} : { "Content-Type": "application/json" }) },
    ...(method === "GET" ? {} : { body: await request.text() }),
    cache: "no-store",
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}

export const GET = (request: Request) => forward(request, "GET");
export const PUT = (request: Request) => forward(request, "PUT");
export const POST = (request: Request) => forward(request, "POST");
