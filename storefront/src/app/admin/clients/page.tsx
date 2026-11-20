import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function AdminClientsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "super_admin") {
    const query = new URLSearchParams({
      lang: "ar",
      redirect: "/admin/clients",
      notice: "owner-only",
    });
    redirect(`/login?${query.toString()}`);
  }

  return (
    <main className="page-shell manager-content">
      <span className="eyebrow">CommerceForge</span>
      <h1>نسخ العملاء والاشتراكات</h1>
      <section className="manager-connection" role="status">
        <div>
          <h2>إدارة النسخ غير مفعّلة بعد</h2>
          <p>لا تُعرض بيانات عملاء أو اشتراكات قبل توصيل خدمة المنصة وقاعدة البيانات.</p>
        </div>
      </section>
    </main>
  );
}
