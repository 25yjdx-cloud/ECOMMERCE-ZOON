import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

export async function GET() {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const response = await fetch(getBackendAuthUrl("api/v1/admin/templates"), { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const payload: unknown = await request.json();
  const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const slug = body.slug;
  const status = body.status;
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug) || (status !== "live" && status !== "draft")) return NextResponse.json({ message: "Invalid template." }, { status: 400 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const response = await fetch(getBackendAuthUrl(`api/v1/admin/templates/${encodeURIComponent(slug)}`), {
    method: "PATCH", headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }), cache: "no-store",
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
}
