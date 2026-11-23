import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: Request, context: Context) {
  if (!["GET", "HEAD"].includes(request.method) && !hasSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const { path } = await context.params;
  if (!path.length || path.some((segment) => segment === "." || segment === "..")) {
    return NextResponse.json({ message: "Invalid merchant resource." }, { status: 400 });
  }
  const target = getBackendAuthUrl("api/v1/merchant/" + path.map(encodeURIComponent).join("/"));
  const source = new URL(request.url);
  source.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  const headers = new Headers({ Accept: "application/json", Authorization: "Bearer " + token });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const response = await fetch(target, { method: request.method, headers, body, cache: "no-store" });
  const payload = await response.arrayBuffer();
  const responseHeaders = new Headers();
  const responseType = response.headers.get("content-type");
  if (responseType) responseHeaders.set("Content-Type", responseType);
  return new NextResponse(payload, { status: response.status, headers: responseHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
