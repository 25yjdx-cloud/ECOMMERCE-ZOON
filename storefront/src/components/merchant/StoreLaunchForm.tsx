"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MockLocale } from "@/mock/types";

type Niche = "clothing" | "electronics" | "beauty" | "food" | "general";

const niches: Array<{ value: Niche; ar: string; en: string }> = [
  { value: "clothing", ar: "ملابس", en: "Clothing" },
  { value: "electronics", ar: "إلكترونيات", en: "Electronics" },
  { value: "beauty", ar: "تجميل", en: "Beauty" },
  { value: "food", ar: "أغذية", en: "Food" },
  { value: "general", ar: "عام", en: "General" },
];

function normalizeWhatsapp(value: string): { phone: string; market: "EG" | "SA" } {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("966")) return { phone: `+${digits}`, market: "SA" };
  if (digits.startsWith("20")) return { phone: `+${digits}`, market: "EG" };
  if (digits.startsWith("05")) return { phone: `+966${digits.slice(1)}`, market: "SA" };
  if (digits.startsWith("5") && digits.length === 9) return { phone: `+966${digits}`, market: "SA" };
  if (digits.startsWith("0")) return { phone: `+20${digits.slice(1)}`, market: "EG" };
  return { phone: `+20${digits}`, market: "EG" };
}

export function StoreLaunchForm({
  locale,
  initialWhatsappPhone,
}: {
  locale: MockLocale;
  initialWhatsappPhone?: string | null;
}) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const [storeName, setStoreName] = useState("");
  const [niche, setNiche] = useState<Niche>("general");
  const [whatsapp, setWhatsapp] = useState(initialWhatsappPhone ?? "");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const contact = normalizeWhatsapp(whatsapp);
    try {
      const response = await fetch("/api/merchant/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName.trim(),
          niche,
          description: description.trim(),
          whatsapp: contact.phone,
          market: contact.market,
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : isArabic ? "تعذر إنشاء المتجر. راجع البيانات وحاول مرة أخرى." : "Could not create the store. Check the details and try again.";
        setError(message);
        return;
      }

      router.replace(`/dashboard/my-store?lang=${locale}`);
      router.refresh();
    } catch (requestError) {
      if (!(requestError instanceof TypeError) && !(requestError instanceof SyntaxError)) throw requestError;
      setError(isArabic ? "تعذر الاتصال بالخادم. حاول مرة أخرى." : "Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form launch-form" onSubmit={submit}>
      <label>
        {isArabic ? "اسم المتجر" : "Store name"}
        <input
          autoComplete="organization"
          maxLength={120}
          minLength={2}
          onChange={(event) => setStoreName(event.currentTarget.value)}
          required
          value={storeName}
        />
      </label>
      <label>
        {isArabic ? "السوق / النشاط" : "Market / niche"}
        <select onChange={(event) => setNiche(event.currentTarget.value as Niche)} value={niche}>
          {niches.map((item) => <option key={item.value} value={item.value}>{isArabic ? item.ar : item.en}</option>)}
        </select>
      </label>
      <label>
        {isArabic ? "رقم الواتساب" : "WhatsApp number"}
        <input
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          minLength={9}
          onChange={(event) => setWhatsapp(event.currentTarget.value)}
          placeholder="+20 10… أو +966 5…"
          required
          type="tel"
          value={whatsapp}
        />
      </label>
      <label>
        {isArabic ? "وصف قصير للمتجر" : "Short store description"}
        <textarea
          maxLength={240}
          minLength={8}
          onChange={(event) => setDescription(event.currentTarget.value)}
          required
          rows={2}
          value={description}
        />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-link auth-submit" disabled={pending} type="submit">
        {pending
          ? isArabic ? "جارٍ تجهيز متجرك…" : "Building your store…"
          : isArabic ? "أنشئ متجري بنقرة واحدة" : "Build my store in one click"}
      </button>
    </form>
  );
}
