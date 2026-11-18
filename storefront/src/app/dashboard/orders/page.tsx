const orders = [
  { number: "MOCK-1001", customer: "عميل تجريبي 1", date: "2026-11-18", status: "قيد التجهيز" },
  { number: "MOCK-1002", customer: "عميل تجريبي 2", date: "2026-11-17", status: "تم التسليم" },
  { number: "MOCK-1003", customer: "عميل تجريبي 3", date: "2026-11-16", status: "بانتظار التأكيد" },
];

export default function DashboardOrdersPage() {
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
