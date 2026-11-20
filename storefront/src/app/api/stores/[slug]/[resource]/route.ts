import { NextResponse } from "next/server";
import { getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

type RouteContext = { params: Promise<{ slug: string; resource: string }> };

async function forward(_request: Request, context: RouteContext) {
  const { slug, resource } = await context.params;
  const allowed = resource === "config" || resource === "products" || resource === "build-payload";
  if (!allowed) return NextResponse.json({ message: "Not found." }, { status: 404 });

  const response = await fetch(getBackendAuthUrl(`api/v1/stores/${encodeURIComponent(slug)}/${resource}`), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = forward;

export async function POST(request: Request, context: RouteContext) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const { slug, resource } = await context.params;
  if (resource !== "returns") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const response = await fetch(getBackendAuthUrl(`api/v1/stores/${encodeURIComponent(slug)}/returns`), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: await request.text(),
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
