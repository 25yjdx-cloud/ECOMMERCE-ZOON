import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl } from "@/lib/auth";

export async function GET(request: Request) {
  const url = getBackendAuthUrl("api/v1/notifications");
  url.searchParams.set("lang", new URL(request.url).searchParams.get("lang") ?? "ar");
  const token = await getAuthToken();
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(8000) });
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError")) {
      return NextResponse.json({ message: "Notifications are temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
