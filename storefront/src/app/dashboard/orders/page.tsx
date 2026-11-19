import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

const orders = [
  { number: "#IOY329", customer: "عميل توضيحي 1", date: "2026-11-18", status: "قيد التجهيز" },
  { number: "#IOY328", customer: "عميل توضيحي 2", date: "2026-11-17", status: "تم التسليم" },
  { number: "#IOY327", customer: "عميل توضيحي 3", date: "2026-11-16", status: "بانتظار التأكيد" },
];

export default async function DashboardOrdersPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?lang=ar&redirect=%2Fdashboard%2Fmy-store");
  if (user.role !== "merchant") redirect("/manager/classic?lang=ar");
  redirect("/dashboard/my-store");

  return (
    <main className="dashboard-page">
      <span className="eyebrow">متابعة تجريبية</span>
      <h1>الطلبات</h1>
      <p className="dashboard-description">لا توجد طلبات عملاء حقيقية في هذه الصفحة.</p>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th scope="col">رقم الطلب</th>
              <th scope="col">العميل</th>
              <th scope="col">التاريخ</th>
              <th scope="col">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.number}>
                <th scope="row">{order.number}</th>
                <td>{order.customer}</td>
                <td dir="ltr">{order.date}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
