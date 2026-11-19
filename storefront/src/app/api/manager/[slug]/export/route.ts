import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getAuthUser, getBackendAuthUrl, getAuthToken } from "@/lib/auth";
import { isPresetId } from "@/lib/presets";

type ExportContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: ExportContext) {
  const { slug } = await context.params;
  const user = await getAuthUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "غير مصرح." }, { status: 403 });
  }
  if (!isPresetId(slug)) return NextResponse.json({ message: "قالب غير معروف." }, { status: 404 });

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ message: "غير مصرح." }, { status: 401 });

  const response = await fetch(getBackendAuthUrl(`api/v1/stores/${slug}/config`), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ message: "تعذر تحميل إعدادات القالب." }, { status: response.status });

  const configPayload: unknown = await response.json();
  const modulePath = path.join(process.cwd(), "src", "templates", slug, "index.tsx");
  const typePath = path.join(process.cwd(), "src", "templates", "types.ts");
  const [moduleSource, typesSource] = await Promise.all([
    readFile(modulePath, "utf8"),
    readFile(typePath, "utf8"),
  ]);
  const zip = new JSZip();
  zip.file("commerceforge-template.json", JSON.stringify({
    template: slug,
    exportedAt: new Date().toISOString(),
    store: configPayload,
    notice: "Template module export; connect it to a CommerceForge/Next.js application to run.",
  }, null, 2));
  zip.file(`src/templates/${slug}/index.tsx`, moduleSource);
  zip.file("src/templates/types.ts", typesSource);
  zip.file("package.json", JSON.stringify({
    name: `commerceforge-${slug}-template`,
    private: true,
    description: "CommerceForge storefront template module export.",
  }, null, 2));
  const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  const archive = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(archive).set(bytes);

  return new NextResponse(archive, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-commerceforge-template.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
