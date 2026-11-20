import { getBackendAuthUrl } from "@/lib/auth";
import { isStoreBuildPayloadResponse, type StoreBuildPayload } from "@/lib/store-payload";

export async function getStoreBuildPayload(slug: string): Promise<StoreBuildPayload | null> {
  const response = await fetch(getBackendAuthUrl(`api/v1/stores/${encodeURIComponent(slug)}/build-payload`), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Store payload request failed (${response.status}).`);

  const payload: unknown = await response.json();
  if (!isStoreBuildPayloadResponse(payload)) {
    throw new Error("Store payload returned an invalid format.");
  }

  return payload.data;
}
