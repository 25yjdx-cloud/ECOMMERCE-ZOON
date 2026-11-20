"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";
import { formatMarketPrice, getTurnkeyPackageName, getTurnkeyPrice, MARKET_CONFIG } from "@/config/pricing.config";
import { MarketSwitcher, useMarket } from "./MarketSwitcher";

export function QuoteRequestForm({
  content,
  locale,
}: {
  content: Dictionary["quote"];
  locale: MockLocale;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [market, setMarket] = useMarket();
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function buildWhatsAppUrl(selectedPackageName: string, selectedPrice: number) {
    const dialCode = MARKET_CONFIG[market].dialCode;
    const localDigits = phone.replace(/\D/g, "").replace(/^0/, "");
    const normalizedPhone = `${dialCode}${localDigits}`;
    const msg = [
      "مرحباً، أرغب في بناء متجر إلكتروني متكامل عبر CommerceForge:",
      `• الباقة: ${selectedPackageName} — ${formatMarketPrice(selectedPrice, market, locale)}`,
      `• الاسم: ${name || "غير محدد"}`,
      `• رقم الواتساب: ${normalizedPhone || `${dialCode}غير محدد`}`,
      `• البريد الإلكتروني: ${email.trim().toLowerCase() || "غير محدد"}`,
      `• تفاصيل المشروع: ${message || "لا توجد تفاصيل إضافية"}`,
    ].join("\n");

    return `https://wa.me/201145335168?text=${encodeURIComponent(msg)}`;
  }

  function sendRequest(openWhatsApp: boolean) {
    setError("");
    setSuccess(false);
    const dialCode = MARKET_CONFIG[market].dialCode;
    const localDigits = phone.replace(/\D/g, "").replace(/^0/, "");
    const whatsappPhone = `${dialCode}${localDigits}`;
    const selectedPackage = content.packages.find((item) => item.id === packageId);
    const selectedPrice = getTurnkeyPrice(packageId, market);
    if (!selectedPackage || selectedPrice === undefined) {
      setError(locale === "ar" ? "اختر باقة التنفيذ أولاً." : "Select an implementation package first.");
      return;
    }

    const selectedPackageName = getTurnkeyPackageName(packageId) ?? selectedPackage.name;
    const waUrl = buildWhatsAppUrl(selectedPackageName, selectedPrice);
    setSubmitting(true);

    void fetch("/api/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: whatsappPhone,
        email: email.trim().toLowerCase(),
        package_id: packageId || null,
        message,
        market,
      }),
    }).catch(() => undefined).finally(() => setSubmitting(false));

    setSuccess(true);
    if (openWhatsApp) {
      window.location.href = waUrl;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendRequest(true);
  }

  const selectedPackageForLink = content.packages.find((item) => item.id === packageId);
  const selectedPriceForLink = getTurnkeyPrice(packageId, market);
  const directWhatsAppHref =
    selectedPackageForLink && selectedPriceForLink !== undefined
      ? buildWhatsAppUrl(getTurnkeyPackageName(packageId) ?? selectedPackageForLink.name, selectedPriceForLink)
      : "https://wa.me/201145335168";

  return (
    <div className="quote-panel">
      <MarketSwitcher locale={locale} />
      <div className="quote-packages">
        {content.packages.map((item) => {
          const price = getTurnkeyPrice(item.id, market);
          return (
            <button
              aria-pressed={packageId === item.id}
              className="quote-package"
              key={item.id}
              onClick={() => setPackageId(item.id)}
              type="button"
            >
              <strong>{item.name}</strong>
              <span>{price === undefined ? item.price : formatMarketPrice(price, market, locale)}</span>
              <small>{item.description}</small>
            </button>
          );
        })}
      </div>
      <p className="market-payment-copy">{MARKET_CONFIG[market].paymentShipping[locale]}</p>
      <form className="quote-form" onSubmit={submit}>
        <label>{content.name}<input autoComplete="name" minLength={4} onChange={(event) => setName(event.target.value)} required value={name} /></label>
        <label>{content.phone}
          <div className="quote-phone-control">
            <select
              aria-label={locale === "ar" ? "مفتاح الدولة" : "Country calling code"}
              onChange={(event) => setMarket(event.target.value === "+966" ? "SA" : "EG")}
              value={MARKET_CONFIG[market].dialCode}
            >
              <option value="+20">🇪🇬 +20</option>
              <option value="+966">🇸🇦 +966</option>
            </select>
            <input autoComplete="tel-national" dir="ltr" inputMode="numeric" maxLength={11} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} required type="tel" value={phone} />
          </div>
        </label>
        <label>{content.email}<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="quote-message">{content.message}<textarea maxLength={2000} onChange={(event) => setMessage(event.target.value)} rows={3} value={message} /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {success && <p className="auth-notice" role="status">{locale === "ar" ? "تم تجهيز طلبك! جاري فتح واتساب..." : "Your request is ready! Opening WhatsApp..."}</p>}
        <div className="quote-submit-actions">
          <button className="button-link" disabled={submitting} type="submit">{submitting ? content.sending : content.submit}</button>
          <a className="button-link secondary" href={directWhatsAppHref} aria-disabled={!packageId}>
            {content.whatsapp}
          </a>
        </div>
      </form>
      <div className="quote-contact-links">
        <a className="button-link secondary" href="https://wa.me/201145335168">{content.call}</a>
      </div>
      <p className="quote-disclaimer">{content.disclaimer}</p>
    </div>
  );
}
