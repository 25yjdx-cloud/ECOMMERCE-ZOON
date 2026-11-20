import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function NotFound() {
  return (
    <main className="brand-system-page" dir="rtl" lang="ar">
      <BrandLogo size={68} variant="full" />
      <span className="eyebrow">404 · الصفحة غير موجودة</span>
      <h1>يبدو أن هذه الصفحة غير متاحة</h1>
      <p>تحقق من الرابط أو ارجع إلى الصفحة الرئيسية لمتابعة استكشاف CommerceForge.</p>
      <Link className="button-link" href="/">العودة للرئيسية</Link>
    </main>
  );
}
