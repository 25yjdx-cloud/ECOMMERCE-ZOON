import { NextResponse } from "next/server";
import { getAuthToken, getBackendAuthUrl } from "@/lib/auth";

export async function GET(_request: Request, context: { params: Promise<{ dataset: string }> }) {
  const { dataset } = await context.params;
  if (!["stores", "events", "orders"].includes(dataset)) return NextResponse.json({ message: "Not found." }, { status: 404 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const response = await fetch(getBackendAuthUrl(`api/v1/admin/exports/${dataset}`), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "text/csv", "Content-Disposition": response.headers.get("content-disposition") ?? `attachment; filename=commerceforge-${dataset}.csv` } });
}
