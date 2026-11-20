import { NextResponse } from "next/server";
import { getBackendAuthUrl } from "@/lib/auth";

type WebhookRouteContext = {
  params: Promise<{ provider: string }>;
};

export async function POST(request: Request, context: WebhookRouteContext) {
  const { provider } = await context.params;
  if (provider !== "bosta" && provider !== "oto") {
    return NextResponse.json({ message: "Unsupported shipping provider." }, { status: 404 });
  }

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": request.headers.get("content-type") ?? "application/json",
  });
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("Authorization", authorization);

  let response: Response;
  try {
    response = await fetch(getBackendAuthUrl(`api/v1/webhooks/shipping/${provider}`), {
      method: "POST",
      headers,
      body: await request.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json({ message: "Shipping webhook is temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
