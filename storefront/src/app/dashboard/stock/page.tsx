const stockItems = [
  { name: "فستان ليلكي", quantity: 18, status: "مستقر" },
  { name: "حقيبة كتف", quantity: 9, status: "مستقر" },
  { name: "وشاح ناعم", quantity: 2, status: "يحتاج إعادة تزويد" },
];

export default function DashboardStockPage() {
  return (
    <main className="dashboard-page">
      <span className="eyebrow">متابعة تجريبية</span>
      <h1>المخزون</h1>
      <p className="dashboard-description">هذه الكميات للعرض فقط ولا تمثل مخزونًا فعليًا.</p>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th scope="col">المنتج</th>
              <th scope="col">الكمية المتاحة</th>
              <th scope="col">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.name}>
                <th scope="row">{item.name}</th>
                <td>{item.quantity}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
