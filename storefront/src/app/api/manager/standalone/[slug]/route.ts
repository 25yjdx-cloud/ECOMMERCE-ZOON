import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

const standaloneFiles: Record<string, string> = {
  classic: "classic.standalone.tsx",
  nabd: "sports.standalone.tsx",
  sports: "sports.standalone.tsx",
  fashion: "fashion.standalone.tsx",
  furniture: "furniture.standalone.tsx",
  "local-brand": "local-brand.standalone.tsx",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getAuthUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ message: "غير مصرح." }, { status: 403 });
  }

  const { slug } = await params;
  const filename = standaloneFiles[slug];
  if (!filename) return NextResponse.json({ message: "القالب غير موجود." }, { status: 404 });

  const contents = await readFile(join(process.cwd(), "src", "standalone-templates", filename), "utf8");
  return new NextResponse(contents, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
