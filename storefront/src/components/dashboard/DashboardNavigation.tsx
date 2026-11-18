import Link from "next/link";

const navigationItems = [
  { href: "/dashboard", label: "نظرة عامة" },
  { href: "/dashboard/products", label: "المنتجات" },
  { href: "/dashboard/orders", label: "الطلبات" },
  { href: "/dashboard/stock", label: "المخزون" },
];

export function DashboardNavigation() {
  return (
    <aside className="dashboard-sidebar">
      <Link className="dashboard-brand" href="/dashboard">
        CommerceForge
        <span>لوحة تجريبية</span>
      </Link>
      <nav aria-label="تنقل لوحة المتجر">
        {navigationItems.map((item) => (
          <Link className="dashboard-nav-link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
