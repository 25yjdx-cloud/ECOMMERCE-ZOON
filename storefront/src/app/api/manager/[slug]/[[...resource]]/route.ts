import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl } from "@/lib/auth";

type ManagerRouteContext = {
  params: Promise<{ slug: string; resource?: string[] }>;
};

async function forward(request: Request, context: ManagerRouteContext): Promise<NextResponse> {
  const { slug, resource = [] } = await context.params;
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "غير مصرح." }, { status: 401 });

  const path = slug === "quotes"
    ? "api/v1/quote-requests"
    : `api/v1/stores/${encodeURIComponent(slug)}/${resource.map(encodeURIComponent).join("/")}`;
  const url = getBackendAuthUrl(path);
  const sourceUrl = new URL(request.url);
  sourceUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("Content-Type", request.headers.get("content-type") ?? "application/json");
    body = await request.text();
  }

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
