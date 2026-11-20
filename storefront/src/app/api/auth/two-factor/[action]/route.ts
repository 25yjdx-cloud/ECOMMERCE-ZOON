import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl, hasSameOrigin } from "@/lib/auth";

type RouteContext = { params: Promise<{ action: string }> };
const allowedActions = new Set(["setup", "verify", "disable"]);

async function forward(request: Request, context: RouteContext) {
  if (!hasSameOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });

  const { action } = await context.params;
  if (!allowedActions.has(action)) return NextResponse.json({ message: "Not found." }, { status: 404 });

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "غير مصرح." }, { status: 401 });

  const method = action === "disable" ? "DELETE" : "POST";
  const response = await fetch(getBackendAuthUrl(`api/v1/auth/two-factor/${action}`), {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
    },
    body: await request.text(),
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return forward(request, context);
}
