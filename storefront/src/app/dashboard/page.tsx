const overviewMetrics = [
  { label: "إجمالي الطلبات", value: "124", detail: "بيانات تجريبية" },
  { label: "المنتجات", value: "38", detail: "بيانات تجريبية" },
  { label: "طلبات قيد المتابعة", value: "7", detail: "بيانات تجريبية" },
  { label: "تنبيهات المخزون", value: "3", detail: "بيانات تجريبية" },
];

export default function DashboardOverviewPage() {
  return (
    <main className="dashboard-page">
      <span className="eyebrow">مساحة إدارة تجريبية</span>
      <h1>نظرة عامة</h1>
      <p className="dashboard-description">
        هذه واجهة توضيحية فقط. الأرقام والسجلات المعروضة غير حقيقية.
      </p>
      <section aria-label="ملخص المتجر التجريبي" className="dashboard-metrics">
        {overviewMetrics.map((metric) => (
          <article className="dashboard-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </section>
      <section className="dashboard-panel">
        <h2>حالة النسخة التجريبية</h2>
        <p>لا توجد قاعدة بيانات متصلة، ولا تُحفظ أي تغييرات.</p>
      </section>
    </main>
  );
}
