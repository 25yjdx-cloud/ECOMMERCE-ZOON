"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";

type StoreLaunchFormProps = {
  locale: MockLocale;
  preset: Preset;
};

type DomainMode = "subdomain" | "custom";

const copy = {
  ar: {
    name: "اسم المتجر",
    slug: "رابط المتجر",
    logo: "رابط شعار المتجر (اختياري)",
    color: "لون الهوية",
    whatsapp: "رقم واتساب",
    subdomain: "نطاق مجاني",
    custom: "طلب ربط دومين خاص ونشر المتجر",
    customHint: "يتطلب اشتراكاً شهرياً ورسوم تنفيذ. سيُسجّل الطلب للمراجعة.",
    customDomain: "الدومين المطلوب (اختياري)",
    submit: "إنشاء متجري",
    saving: "جارٍ إنشاء المتجر...",
    error: "تعذر إنشاء المتجر. تحقق من البيانات واتصال الخادم.",
    required: "أكمل الحقول المطلوبة.",
  },
  en: {
    name: "Store name",
    slug: "Store URL",
    logo: "Store logo URL (optional)",
    color: "Brand color",
    whatsapp: "WhatsApp number",
    subdomain: "Free subdomain",
    custom: "Request custom domain publishing",
    customHint: "Requires a monthly plan and implementation fee. The request will be recorded for review.",
    customDomain: "Requested domain (optional)",
    submit: "Create my store",
    saving: "Creating your store...",
    error: "Could not create the store. Check the details and backend connection.",
    required: "Complete the required fields.",
  },
} satisfies Record<MockLocale, Record<string, string>>;

function messageFromPayload(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

export function StoreLaunchForm({ locale, preset }: StoreLaunchFormProps) {
  const router = useRouter();
  const text = copy[locale];
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#D9541E");
  const [whatsapp, setWhatsapp] = useState("");
  const [domainMode, setDomainMode] = useState<DomainMode>("subdomain");
  const [customDomain, setCustomDomain] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/merchant/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_slug: storeSlug,
          template_slug: preset.id,
          store_name: storeName,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          whatsapp,
          domain_mode: domainMode,
          custom_domain: customDomain || null,
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(messageFromPayload(payload, text.error));
        return;
      }

      router.replace(`/dashboard/my-store?lang=${locale}`);
      router.refresh();
    } catch (requestError) {
      if (!(requestError instanceof TypeError) && !(requestError instanceof SyntaxError)) throw requestError;
      setError(text.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-card auth-form launch-form" onSubmit={submit}>
      <label>
        {text.name}
        <input
          autoComplete="organization"
          minLength={2}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setStoreName(value);
            if (!slugEdited) {
              setStoreSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
            }
          }}
          required
          value={storeName}
        />
      </label>
      <label>
        {text.slug}
        <div className="launch-domain-field">
          <input
            autoCapitalize="none"
            autoComplete="off"
            maxLength={48}
            minLength={3}
            onChange={(event) => {
              setSlugEdited(true);
              setStoreSlug(event.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            value={storeSlug}
          />
          <span>.elmatajer.com</span>
        </div>
      </label>
      <label>
        {text.logo}
        <input
          onChange={(event) => setLogoUrl(event.currentTarget.value)}
          type="url"
          value={logoUrl}
        />
      </label>
      <label>
        {text.color}
        <input
          className="launch-color-input"
          onChange={(event) => setPrimaryColor(event.currentTarget.value)}
          type="color"
          value={primaryColor}
        />
      </label>
      <label>
        {text.whatsapp}
        <input
          autoComplete="tel"
          inputMode="tel"
          onChange={(event) => setWhatsapp(event.currentTarget.value.replace(/\s+/g, ""))}
          pattern="01[0125][0-9]{8}"
          placeholder="01XXXXXXXXX"
          required
          value={whatsapp}
        />
      </label>
      <fieldset className="launch-domain-options">
        <legend>{locale === "ar" ? "طريقة النشر" : "Publishing option"}</legend>
        <label>
          <input
            checked={domainMode === "subdomain"}
            name="domain_mode"
            onChange={() => setDomainMode("subdomain")}
            type="radio"
          />
          <span>{text.subdomain}</span>
        </label>
        <label>
          <input
            checked={domainMode === "custom"}
            name="domain_mode"
            onChange={() => setDomainMode("custom")}
            type="radio"
          />
          <span>{text.custom}</span>
        </label>
        {domainMode === "custom" && (
          <>
            <p>{text.customHint}</p>
            <input
              aria-label={text.customDomain}
              autoCapitalize="none"
              onChange={(event) => setCustomDomain(event.target.value.trim())}
              placeholder={text.customDomain}
              value={customDomain}
            />
          </>
        )}
      </fieldset>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-link auth-submit" disabled={pending} type="submit">
        {pending ? text.saving : text.submit}
      </button>
    </form>
  );
}
