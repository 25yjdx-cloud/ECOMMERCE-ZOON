const products = [
  { name: "فستان ليلكي", category: "أزياء", stock: 18, status: "متاح" },
  { name: "حقيبة كتف", category: "حقائب", stock: 9, status: "متاح" },
  { name: "وشاح ناعم", category: "إكسسوارات", stock: 2, status: "مخزون منخفض" },
];

export default function DashboardProductsPage() {
  return (
    <main className="dashboard-page">
      <span className="eyebrow">إدارة الكتالوج التجريبي</span>
      <h1>المنتجات</h1>
      <p className="dashboard-description">قائمة توضيحية بمنتجات غير حقيقية.</p>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th scope="col">المنتج</th>
              <th scope="col">القسم</th>
              <th scope="col">الكمية</th>
              <th scope="col">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.name}>
                <th scope="row">{product.name}</th>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>{product.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
