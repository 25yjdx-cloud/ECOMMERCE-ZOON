"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import type { MockLocale } from "@/mock/types";
import { useTheme } from "@/components/theme/ThemeProvider";

const templates = [
  ["classic", "كلاسيكي", "Classic"],
  ["nabd", "نَبض", "Nabd"],
  ["fashion", "فريدة", "Farida"],
  ["furniture", "دارك", "Darak"],
  ["local-brand", "هوية", "Hawia"],
] as const;

export function Footer({ locale }: { locale: MockLocale }) {
  const isArabic = locale === "ar";
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="platform-footer" dir={isArabic ? "rtl" : "ltr"}>
      <div className="platform-footer-callout">
        <h2>{isArabic ? "جاهز تطلق متجرك الإلكتروني اليوم؟" : "Ready to launch your online store today?"}</h2>
        <div>
          <Link className="footer-primary-cta" href={`/login?lang=${locale}`}>
            {isArabic ? "ابدأ مجاناً ←" : "Start for free →"}
          </Link>
          <a className="footer-whatsapp-button" href="https://wa.me/201145335168" rel="noreferrer" target="_blank">
            {isArabic ? "واتساب: 01145335168" : "WhatsApp: 01145335168"}
          </a>
        </div>
      </div>
      <div className="platform-footer-grid">
        <section className="footer-brand-column">
          <Link className="footer-brand" href={`/?lang=${locale}`}>
            <span aria-hidden="true" className="brand-symbol">C</span>
            <strong>CommerceForge</strong>
          </Link>
          <p>
            {isArabic
              ? "منصة عربية لإطلاق متاجر مستقلة بهوية واضحة وتجربة بيع موثوقة."
              : "An Arabic-first platform for independent stores with clear identities and trusted selling experiences."}
          </p>
          <span className="footer-trust-line">COD • InstaPay</span>
        </section>
        <section>
          <h3>{isArabic ? "القوالب" : "Templates"}</h3>
          <ul>
            {templates.map(([slug, arabicName, englishName]) => (
              <li key={slug}>
                <Link href={`/preview/${slug}?lang=${locale}`}>{isArabic ? arabicName : englishName}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>{isArabic ? "المنصة والحساب" : "Platform & account"}</h3>
          <ul>
            <li><Link href={`/?lang=${locale}`}>{isArabic ? "الرئيسية" : "Home"}</Link></li>
            <li><Link href={`/#pricing`}>{isArabic ? "الباقات والأسعار" : "Plans & pricing"}</Link></li>
            <li><Link href={`/account?lang=${locale}`}>{isArabic ? "إعدادات الحساب" : "Account settings"}</Link></li>
            <li><Link href={`/notifications?lang=${locale}`}>{isArabic ? "الإشعارات" : "Notifications"}</Link></li>
          </ul>
        </section>
        <section>
          <h3>{isArabic ? "تواصل مباشر" : "Direct contact"}</h3>
          <ul>
            <li><a href="https://wa.me/201145335168" rel="noreferrer" target="_blank">{isArabic ? "واتساب" : "WhatsApp"}</a></li>
            <li><a dir="ltr" href="tel:+201145335168">01145335168</a></li>
            <li><Link href="/#contact">{isArabic ? "اطلب عرض سعر" : "Request a quote"}</Link></li>
          </ul>
        </section>
      </div>
      <div className="platform-footer-bottom">
        <span>© 2026 CommerceForge. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
        <div className="footer-bottom-tools">
          <Link href="/?lang=ar">عربي</Link>
          <span aria-hidden="true">/</span>
          <Link href="/?lang=en">EN</Link>
          <button aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme} type="button">
            {theme === "dark" ? <Sun aria-hidden="true" size={16} /> : <Moon aria-hidden="true" size={16} />}
            {theme === "dark" ? isArabic ? "فاتح" : "Light" : isArabic ? "داكن" : "Dark"}
          </button>
        </div>
      </div>
    </footer>
  );
}
