import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

type RouteContext = { params: Promise<{ slug: string; resource: string }> };

async function forward(_request: Request, context: RouteContext) {
  const { slug, resource } = await context.params;
  const allowed = resource === "config" || resource === "products";
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
