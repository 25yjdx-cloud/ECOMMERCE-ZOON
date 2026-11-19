"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MockLocale } from "@/mock/types";

type StoreConfig = {
  store_name?: string;
  logo_url?: string | null;
  primary_color?: string;
  whatsapp?: string;
  plan?: string;
  domain_mode?: "subdomain" | "custom";
  domain?: string | null;
  custom_domain_status?: string;
};

type StoreMetadata = {
  slug: string;
  templateSlug: string;
  config: StoreConfig;
};

type Product = {
  id: number;
  name_ar: string;
  name_en: string;
  price: number;
  stock_qty: number;
  description_ar: string | null;
  description_en: string | null;
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  total: number;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
};

type ApiResponse<T> = { data: T };
type Section = "branding" | "products" | "orders" | "domain";
type DashboardCopy = {
  branding: string;
  products: string;
  orders: string;
  domain: string;
  loading: string;
  loadError: string;
  save: string;
  saved: string;
  addProduct: string;
  editProduct: string;
  nameAr: string;
  nameEn: string;
  price: string;
  stock: string;
  saveProduct: string;
  cancelEdit: string;
  delete: string;
  edit: string;
  noProducts: string;
  noOrders: string;
  status: string;
  openWhatsApp: string;
  activePlan: string;
  freePlan: string;
  domainLabel: string;
  domainStatus: string;
  pending: string;
  active: string;
  none: string;
  preview: string;
  refresh: string;
  states: Record<Order["status"], string>;
};

const copy = {
  ar: {
    branding: "تخصيص الهوية",
    products: "منتجاتي",
    orders: "طلباتي",
    domain: "الدومين والاشتراك",
    loading: "جارٍ تحميل بيانات المتجر...",
    loadError: "تعذر تحميل بيانات المتجر. تحقق من اتصال الخادم وحاول مجدداً.",
    save: "حفظ الهوية",
    saved: "تم حفظ التغييرات.",
    addProduct: "إضافة منتج",
    editProduct: "تعديل المنتج",
    nameAr: "اسم المنتج بالعربية",
    nameEn: "اسم المنتج بالإنجليزية",
    price: "السعر بالجنيه",
    stock: "الكمية المتاحة",
    saveProduct: "حفظ المنتج",
    cancelEdit: "إلغاء التعديل",
    delete: "حذف",
    edit: "تعديل",
    noProducts: "لا توجد منتجات في المتجر.",
    noOrders: "لا توجد طلبات حتى الآن.",
    status: "حالة الطلب",
    openWhatsApp: "مراسلة العميل",
    activePlan: "الباقة الحالية",
    freePlan: "البداية — مجانية",
    domainLabel: "عنوان المتجر",
    domainStatus: "حالة طلب الدومين الخاص",
    pending: "قيد المراجعة",
    active: "نشط",
    none: "لا يوجد طلب دومين خاص",
    preview: "معاينة متجري",
    refresh: "تحديث البيانات",
    states: { new: "جديد", processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" },
  },
  en: {
    branding: "Branding",
    products: "My products",
    orders: "My orders",
    domain: "Domain & plan",
    loading: "Loading store data...",
    loadError: "Could not load store data. Check the backend connection and retry.",
    save: "Save branding",
    saved: "Changes saved.",
    addProduct: "Add product",
    editProduct: "Edit product",
    nameAr: "Product name in Arabic",
    nameEn: "Product name in English",
    price: "Price in EGP",
    stock: "Available quantity",
    saveProduct: "Save product",
    cancelEdit: "Cancel edit",
    delete: "Delete",
    edit: "Edit",
    noProducts: "This store has no products yet.",
    noOrders: "No orders yet.",
    status: "Order status",
    openWhatsApp: "Message customer",
    activePlan: "Current plan",
    freePlan: "Starter — Free",
    domainLabel: "Store address",
    domainStatus: "Custom domain request status",
    pending: "Under review",
    active: "Active",
    none: "No custom-domain request",
    preview: "Preview my store",
    refresh: "Refresh data",
    states: { new: "New", processing: "Preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" },
  },
} satisfies Record<MockLocale, DashboardCopy>;

const apiBase = (slug: string) => `/api/manager/${encodeURIComponent(slug)}`;

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `20${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export function MerchantStoreDashboard({ slug, locale }: { slug: string; locale: MockLocale }) {
  const text = copy[locale];
  const [section, setSection] = useState<Section>("branding");
  const [store, setStore] = useState<StoreMetadata>();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#D9541E");
  const [whatsapp, setWhatsapp] = useState("");
  const [productNameAr, setProductNameAr] = useState("");
  const [productNameEn, setProductNameEn] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("0");
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const base = apiBase(slug);
      const [storeResult, productsResult, ordersResult] = await Promise.all([
        requestJson<ApiResponse<StoreMetadata>>(`${base}/config`),
        requestJson<ApiResponse<Product[]>>(`${base}/products`),
        requestJson<ApiResponse<Order[]>>(`${base}/orders`),
      ]);
      setStore(storeResult.data);
      setProducts(productsResult.data);
      setOrders(ordersResult.data);
      setStoreName(storeResult.data.config.store_name ?? "");
      setLogoUrl(storeResult.data.config.logo_url ?? "");
      setPrimaryColor(storeResult.data.config.primary_color ?? "#D9541E");
      setWhatsapp(storeResult.data.config.whatsapp ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.loadError);
    } finally {
      setLoading(false);
    }
  }, [slug, text.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const formattedOrderTotal = useMemo(
    () => new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }),
    [locale],
  );

  async function saveBranding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    try {
      await requestJson(`${apiBase(slug)}/config`, {
        method: "PUT",
        body: JSON.stringify({
          store_name: storeName,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          whatsapp,
        }),
      });
      setNotice(text.saved);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.loadError);
    } finally {
      setPending(false);
    }
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    try {
      const editing = products.find(({ id }) => id === editingProduct);
      await requestJson(
        editing ? `${apiBase(slug)}/products/${editing.id}` : `${apiBase(slug)}/products`,
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            name_ar: productNameAr,
            name_en: productNameEn,
            price: Number(productPrice),
            stock_qty: Number(productStock),
            description_ar: editing?.description_ar ?? null,
            description_en: editing?.description_en ?? null,
          }),
        },
      );
      setEditingProduct(null);
      setProductNameAr("");
      setProductNameEn("");
      setProductPrice("");
      setProductStock("0");
      setNotice(text.saved);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.loadError);
    } finally {
      setPending(false);
    }
  }

  async function deleteProduct(id: number) {
    setPending(true);
    setError("");
    setNotice("");

    try {
      await requestJson(`${apiBase(slug)}/products/${id}`, { method: "DELETE" });
      setNotice(text.saved);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : text.loadError);
    } finally {
      setPending(false);
    }
  }

  async function updateOrder(id: number, status: Order["status"]) {
    setPending(true);
    setError("");
    setNotice("");

    try {
      await requestJson(`${apiBase(slug)}/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setNotice(text.saved);
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : text.loadError);
    } finally {
      setPending(false);
    }
  }

  function editProduct(product: Product) {
    setEditingProduct(product.id);
    setProductNameAr(product.name_ar);
    setProductNameEn(product.name_en);
    setProductPrice(String(product.price));
    setProductStock(String(product.stock_qty));
    setSection("products");
  }

  const domainStatus = store?.config.custom_domain_status;

  return (
    <section className="merchant-workspace">
      <nav aria-label={locale === "ar" ? "إدارة المتجر" : "Store management"} className="merchant-tabs">
        {(["branding", "products", "orders", "domain"] as const).map((item) => (
          <button
            aria-pressed={section === item}
            key={item}
            onClick={() => setSection(item)}
            type="button"
          >
            {text[item]}
          </button>
        ))}
        {store && (
          <Link
            className="button-link secondary merchant-preview-link"
            href={`/preview/${store.templateSlug}?store=${encodeURIComponent(slug)}&lang=${locale}`}
          >
            {text.preview}
          </Link>
        )}
      </nav>

      <div className="merchant-panel">
        <div className="merchant-panel-heading">
          <h2>{text[section]}</h2>
          <button className="text-button" disabled={loading || pending} onClick={() => void load()} type="button">
            {text.refresh}
          </button>
        </div>
        {loading && <p role="status">{text.loading}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}

        {!loading && section === "branding" && (
          <form className="auth-form merchant-form-grid" onSubmit={saveBranding}>
            <label>
              {locale === "ar" ? "اسم المتجر" : "Store name"}
              <input minLength={2} onChange={(event) => setStoreName(event.target.value)} required value={storeName} />
            </label>
            <label>
              {locale === "ar" ? "رابط الشعار" : "Logo URL"}
              <input onChange={(event) => setLogoUrl(event.target.value)} type="url" value={logoUrl} />
            </label>
            <label>
              {locale === "ar" ? "لون الهوية" : "Brand color"}
              <input
                className="launch-color-input"
                onChange={(event) => setPrimaryColor(event.target.value)}
                type="color"
                value={primaryColor}
              />
            </label>
            <label>
              {locale === "ar" ? "واتساب التواصل" : "Contact WhatsApp"}
              <input
                inputMode="tel"
                onChange={(event) => setWhatsapp(event.target.value.replace(/\s+/g, ""))}
                pattern="01[0125][0-9]{8}"
                required
                value={whatsapp}
              />
            </label>
            <button className="button-link" disabled={pending} type="submit">{text.save}</button>
          </form>
        )}

        {!loading && section === "products" && (
          <>
            <form className="auth-form merchant-form-grid" onSubmit={saveProduct}>
              <h3>{editingProduct === null ? text.addProduct : text.editProduct}</h3>
              <label>
                {text.nameAr}
                <input minLength={2} onChange={(event) => setProductNameAr(event.target.value)} required value={productNameAr} />
              </label>
              <label>
                {text.nameEn}
                <input minLength={2} onChange={(event) => setProductNameEn(event.target.value)} required value={productNameEn} />
              </label>
              <label>
                {text.price}
                <input min="0" onChange={(event) => setProductPrice(event.target.value)} required step="0.01" type="number" value={productPrice} />
              </label>
              <label>
                {text.stock}
                <input min="0" onChange={(event) => setProductStock(event.target.value)} required type="number" value={productStock} />
              </label>
              <div className="merchant-form-actions">
                <button className="button-link" disabled={pending} type="submit">{text.saveProduct}</button>
                {editingProduct !== null && (
                  <button
                    className="button-link secondary"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductNameAr("");
                      setProductNameEn("");
                      setProductPrice("");
                      setProductStock("0");
                    }}
                    type="button"
                  >
                    {text.cancelEdit}
                  </button>
                )}
              </div>
            </form>
            {products.length === 0 ? <p>{text.noProducts}</p> : (
              <div className="merchant-product-list">
                {products.map((product) => (
                  <article className="merchant-product-row" key={product.id}>
                    <div>
                      <strong>{locale === "ar" ? product.name_ar : product.name_en}</strong>
                      <span>{formattedOrderTotal.format(Number(product.price))} · {product.stock_qty}</span>
                    </div>
                    <div className="merchant-form-actions">
                      <button className="text-button" disabled={pending} onClick={() => editProduct(product)} type="button">{text.edit}</button>
                      <button className="text-button danger-text" disabled={pending} onClick={() => void deleteProduct(product.id)} type="button">{text.delete}</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && section === "orders" && (
          orders.length === 0 ? <p>{text.noOrders}</p> : (
            <div className="merchant-order-list">
              {orders.map((order) => (
                <article className="merchant-order-row" key={order.id}>
                  <div>
                    <strong>{order.order_number}</strong>
                    <span>{order.customer_name} · {formattedOrderTotal.format(Number(order.total))}</span>
                  </div>
                  <label>
                    {text.status}
                    <select
                      disabled={pending}
                      onChange={(event) => void updateOrder(order.id, event.target.value as Order["status"])}
                      value={order.status}
                    >
                      {Object.entries(text.states).map(([status, label]) => (
                        <option key={status} value={status}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <a className="button-link secondary" href={whatsappUrl(order.phone)} rel="noreferrer" target="_blank">
                    {text.openWhatsApp}
                  </a>
                </article>
              ))}
            </div>
          )
        )}

        {!loading && section === "domain" && (
          <div className="merchant-domain-summary">
            <p><strong>{text.activePlan}:</strong> {text.freePlan}</p>
            <p><strong>{text.domainLabel}:</strong> {store?.config.domain ?? `${slug}.elmatajer.com`}</p>
            <p>
              <strong>{text.domainStatus}:</strong>{" "}
              {domainStatus === "pending" ? text.pending : domainStatus === "active" ? text.active : text.none}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
