"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { MARKET_CONFIG } from "@/config/pricing.config";
import { useMarket } from "@/components/landing/MarketSwitcher";

type StoreLaunchFormProps = {
  locale: MockLocale;
  preset: Preset;
  initialWhatsappPhone?: string | null;
  initialMarket?: "EG" | "SA" | null;
};

type HostingMode = "saas" | "client_hosting";
type InitialProduct = { name_ar: string; name_en: string; price: string; stock_qty: string };

const copy = {
  ar: {
    name: "اسم المتجر",
    slug: "رابط المتجر",
    logo: "رابط شعار المتجر (اختياري)",
    color: "لون الهوية",
    whatsapp: "رقم واتساب",
    saas: "اشتراك شهري واستضافة على المنصة",
    clientHosting: "دومين واستضافة خاصة بالعميل",
    customHint: "خلال 24–48 ساعة يراجع المطور الإعدادات ويؤكد التسليم.",
    customDomain: "الدومين المطلوب",
    initialProducts: "المنتجات الأولية (حتى 5 منتجات)",
    addProduct: "إضافة منتج آخر",
    productNameAr: "اسم المنتج بالعربية",
    productNameEn: "اسم المنتج بالإنجليزية",
    productPrice: "السعر بالجنيه",
    productStock: "الكمية",
    includeProducts: "إضافة منتجات أولية الآن",
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
    saas: "Monthly plan and platform hosting",
    clientHosting: "Client's own domain and hosting",
    customHint: "The developer reviews the setup and confirms delivery within 24–48 hours.",
    customDomain: "Requested domain",
    initialProducts: "Initial products (up to 5)",
    addProduct: "Add another product",
    productNameAr: "Product name in Arabic",
    productNameEn: "Product name in English",
    productPrice: "Price in EGP",
    productStock: "Quantity",
    includeProducts: "Add initial products now",
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

export function StoreLaunchForm({
  locale,
  preset,
  initialWhatsappPhone,
  initialMarket,
}: StoreLaunchFormProps) {
  const router = useRouter();
  const text = copy[locale];
  const [market, setMarket] = useMarket();
  const savedMarket = initialMarket
    ?? (initialWhatsappPhone
      ? initialWhatsappPhone.replace(/\D/g, "").startsWith("966") ? "SA" : "EG"
      : null);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#D9541E");
  const [whatsapp, setWhatsapp] = useState(() => {
    if (!initialWhatsappPhone) return "";
    const nationalNumber = initialWhatsappPhone.replace(/\D/g, "").replace(/^(20|966)/, "");
    return nationalNumber.startsWith("0") ? nationalNumber : `0${nationalNumber}`;
  });
  const [hostingMode, setHostingMode] = useState<HostingMode>("saas");
  const [customDomain, setCustomDomain] = useState("");
  const [includeProducts, setIncludeProducts] = useState(false);
  const [initialProducts, setInitialProducts] = useState<InitialProduct[]>([
    { name_ar: "", name_en: "", price: "", stock_qty: "0" },
  ]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const whatsappDigits = whatsapp.replace(/\D/g, "").replace(/^0/, "");
  const internationalWhatsapp = `${MARKET_CONFIG[market].dialCode}${whatsappDigits}`;

  useEffect(() => {
    if (savedMarket) setMarket(savedMarket);
  }, [savedMarket, setMarket]);

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
          whatsapp: internationalWhatsapp,
          market,
          hosting_mode: hostingMode,
          domain_mode: hostingMode === "saas" ? "subdomain" : "custom",
          custom_domain: customDomain || null,
          initial_products: includeProducts
            ? initialProducts.map((product) => ({
                ...product,
                price: Number(product.price),
                stock_qty: Number(product.stock_qty),
              }))
            : [],
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
        <div className="quote-phone-control">
          <select
            aria-label={locale === "ar" ? "مفتاح الدولة" : "Country calling code"}
            onChange={(event) => setMarket(event.target.value === "+966" ? "SA" : "EG")}
            value={MARKET_CONFIG[market].dialCode}
          >
            <option value="+20">🇪🇬 +20</option>
            <option value="+966">🇸🇦 +966</option>
          </select>
          <input
            autoComplete="tel"
            inputMode="tel"
            maxLength={11}
            onChange={(event) => setWhatsapp(event.currentTarget.value.replace(/\D/g, "").slice(0, 11))}
            pattern={market === "EG" ? "01[0125][0-9]{8}" : "05[0-9]{8}"}
            placeholder={market === "EG" ? "01XXXXXXXXX" : "05XXXXXXXX"}
            required
            value={whatsapp}
          />
        </div>
      </label>
      <fieldset className="launch-domain-options">
        <legend>{locale === "ar" ? "طريقة الاستضافة والتسليم" : "Hosting and delivery"}</legend>
        <label>
          <input
            checked={hostingMode === "saas"}
            name="hosting_mode"
            onChange={() => setHostingMode("saas")}
            type="radio"
          />
          <span>{text.saas}</span>
        </label>
        <label>
          <input
            checked={hostingMode === "client_hosting"}
            name="hosting_mode"
            onChange={() => setHostingMode("client_hosting")}
            type="radio"
          />
          <span>{text.clientHosting}</span>
        </label>
        {hostingMode === "client_hosting" && (
          <>
            <p>{text.customHint}</p>
            <input
              aria-label={text.customDomain}
              autoCapitalize="none"
              required
              onChange={(event) => setCustomDomain(event.target.value.trim())}
              placeholder={text.customDomain}
              value={customDomain}
            />
          </>
        )}
      </fieldset>
      <fieldset className="launch-domain-options">
        <legend>{text.initialProducts}</legend>
        <label>
          <input checked={includeProducts} onChange={(event) => setIncludeProducts(event.target.checked)} type="checkbox" />
          <span>{text.includeProducts}</span>
        </label>
        {includeProducts && initialProducts.map((product, index) => (
          <div className="launch-initial-product" key={index}>
            <label>
              {text.productNameAr}
              <input
                maxLength={180}
                minLength={2}
                onChange={(event) => setInitialProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name_ar: event.target.value } : item))}
                required
                value={product.name_ar}
              />
            </label>
            <label>
              {text.productNameEn}
              <input
                maxLength={180}
                minLength={2}
                onChange={(event) => setInitialProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name_en: event.target.value } : item))}
                required
                value={product.name_en}
              />
            </label>
            <label>
              {text.productPrice}
              <input
                min="0"
                onChange={(event) => setInitialProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))}
                required
                step="0.01"
                type="number"
                value={product.price}
              />
            </label>
            <label>
              {text.productStock}
              <input
                min="0"
                onChange={(event) => setInitialProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, stock_qty: event.target.value } : item))}
                required
                type="number"
                value={product.stock_qty}
              />
            </label>
            {initialProducts.length > 1 && (
              <button
                className="text-button danger-text"
                onClick={() => setInitialProducts((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                type="button"
              >
                {locale === "ar" ? "حذف المنتج" : "Remove product"}
              </button>
            )}
          </div>
        ))}
        {includeProducts && initialProducts.length < 5 && (
          <button
            className="text-button"
            onClick={() => setInitialProducts((current) => [...current, { name_ar: "", name_en: "", price: "", stock_qty: "0" }])}
            type="button"
          >
            {text.addProduct}
          </button>
        )}
      </fieldset>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-link auth-submit" disabled={pending} type="submit">
        {pending ? text.saving : text.submit}
      </button>
    </form>
  );
}
