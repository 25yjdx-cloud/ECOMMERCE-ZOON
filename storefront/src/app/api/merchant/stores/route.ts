import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl } from "@/lib/auth";

export async function POST(request: Request) {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "غير مصرح." }, { status: 401 });

  const response = await fetch(getBackendAuthUrl("api/v1/merchant/stores"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
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
