import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

async function forward(request: Request, method: "GET" | "PATCH") {
  if (method !== "GET" && !hasSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "غير مصرح." }, { status: 401 });

  const response = await fetch(getBackendAuthUrl(
    method === "GET" ? "api/v1/admin/refinement-queue" : `api/v1/admin/stores/${encodeURIComponent(new URL(request.url).searchParams.get("slug") ?? "")}/refinement`,
  ), {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}),
    },
    ...(method === "PATCH" ? { body: await request.text() } : {}),
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export async function GET(request: Request) {
  return forward(request, "GET");
}

export async function PATCH(request: Request) {
  return forward(request, "PATCH");
}
