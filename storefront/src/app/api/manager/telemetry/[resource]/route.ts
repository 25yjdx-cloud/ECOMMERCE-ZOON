import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

const paths: Record<string, string> = {
  "live-radar": "api/v1/admin/live-radar",
  events: "api/v1/admin/events",
  audit: "api/v1/admin/audit",
  stores: "api/v1/admin/stores",
};

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const path = paths[resource];
  if (!path) return NextResponse.json({ message: "Not found." }, { status: 404 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const backend = getBackendAuthUrl(path);
  new URL(request.url).searchParams.forEach((value, key) => backend.searchParams.set(key, value));
  const response = await fetch(backend, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export async function PUT(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!hasSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const { resource } = await context.params;
  const match = resource.match(/^store-config:([a-z0-9-]+)$/);
  if (!match) return NextResponse.json({ message: "Not found." }, { status: 404 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const response = await fetch(getBackendAuthUrl(`api/v1/admin/stores/${encodeURIComponent(match[1])}/visual-config`), {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: await request.text(),
    cache: "no-store",
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
