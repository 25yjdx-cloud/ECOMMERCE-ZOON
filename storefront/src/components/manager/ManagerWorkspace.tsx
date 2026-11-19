"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { MockLocale } from "@/mock/types";

type StoreConfig = {
  store_name: string;
  logo_url: string | null;
  primary_color: string;
  background_color: string;
  mode: "light" | "dark";
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  sections: Record<string, boolean>;
};

type Product = {
  id: number;
  external_id: string | null;
  name_ar: string;
  name_en: string;
  price: string;
  old_price: string | null;
  stock_qty: number;
  variants: string[] | null;
  category_id: number | null;
};

type Category = { id: number; name_ar: string; name_en: string };
type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  total: string;
  status: string;
};
type Quote = { id: number; name: string; phone: string; email: string; package_id: string | null; message: string | null };
type Tab = "design" | "catalog" | "orders" | "quotes" | "export";

const emptyConfig: StoreConfig = {
  store_name: "",
  logo_url: null,
  primary_color: "#D9541E",
  background_color: "#F3EEE3",
  mode: "light",
  hero_title: "",
  hero_subtitle: "",
  hero_cta: "تسوق الآن",
  sections: { hero: true, products: true, categories: true },
};

const tabs: { id: Tab; ar: string; en: string }[] = [
  { id: "design", ar: "تخصيص القالب", en: "Customize" },
  { id: "catalog", ar: "المنتجات والأقسام", en: "Products & categories" },
  { id: "orders", ar: "الطلبات الواردة", en: "Orders" },
  { id: "quotes", ar: "طلبات عروض الأسعار", en: "Quote requests" },
  { id: "export", ar: "نسخ وتصدير المشروع", en: "Clone & export" },
];

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const result: unknown = await response.json();

  if (!response.ok) {
    const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
      ? result.message
      : `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return result as T;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "تعذر الاتصال بالخادم.";
}

export function ManagerWorkspace({
  slug,
  locale,
}: {
  slug: string;
  locale: MockLocale;
}) {
  const isArabic = locale === "ar";
  const base = `/api/manager/${encodeURIComponent(slug)}`;
  const [tab, setTab] = useState<Tab>("design");
  const [config, setConfig] = useState<StoreConfig>(emptyConfig);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name_ar: "",
    name_en: "",
    price: "",
    old_price: "",
    stock_qty: "0",
    category_id: "",
    variants: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name_ar: "", name_en: "" });
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [clientSlug, setClientSlug] = useState("");

  const loadTab = useCallback(async (selected: Tab) => {
    setError("");
    try {
      if (selected === "design") {
        const result = await requestJson<{ data: { config: StoreConfig } }>(`${base}/config`);
        setConfig({ ...emptyConfig, ...result.data.config });
      } else if (selected === "catalog") {
        const [productResult, categoryResult] = await Promise.all([
          requestJson<{ data: Product[] }>(`${base}/products`),
          requestJson<{ data: Category[] }>(`${base}/categories`),
        ]);
        setProducts(productResult.data);
        setCategories(categoryResult.data);
      } else if (selected === "orders") {
        const result = await requestJson<{ data: Order[] }>(`${base}/orders`);
        setOrders(result.data);
      } else if (selected === "quotes") {
        const result = await requestJson<{ data: Quote[] }>("/api/manager/quotes");
        setQuotes(result.data);
      }
    } catch (reason) {
      setError(messageOf(reason));
    }
  }, [base]);

  useEffect(() => {
    void loadTab(tab);
  }, [loadTab, tab]);

  async function saveConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await requestJson<{ data: StoreConfig }>(`${base}/config`, {
        method: "PUT",
        body: JSON.stringify(config),
      });
      setConfig({ ...emptyConfig, ...result.data });
      setNotice(isArabic ? "تم حفظ إعدادات القالب." : "Template settings saved.");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setSaving(false);
    }
  }

  function editProduct(product: Product) {
    setEditingProduct(product.id);
    setProductForm({
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      old_price: product.old_price ?? "",
      stock_qty: String(product.stock_qty),
      category_id: product.category_id ? String(product.category_id) : "",
      variants: product.variants?.join(", ") ?? "",
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : null,
        stock_qty: Number(productForm.stock_qty),
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        variants: productForm.variants.split(",").map((item) => item.trim()).filter(Boolean),
      };
      await requestJson(`${base}/products${editingProduct ? `/${editingProduct}` : ""}`, {
        method: editingProduct ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setProductForm({ name_ar: "", name_en: "", price: "", old_price: "", stock_qty: "0", category_id: "", variants: "" });
      setEditingProduct(null);
      await loadTab("catalog");
      setNotice(isArabic ? "تم حفظ المنتج." : "Product saved.");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await requestJson(`${base}/categories${editingCategory ? `/${editingCategory}` : ""}`, {
        method: editingCategory ? "PUT" : "POST",
        body: JSON.stringify(categoryForm),
      });
      setCategoryForm({ name_ar: "", name_en: "" });
      setEditingCategory(null);
      await loadTab("catalog");
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(resource: "products" | "categories", id: number) {
    if (!window.confirm(isArabic ? "هل تريد حذف هذا العنصر؟" : "Delete this item?")) return;
    setError("");
    try {
      await requestJson(`${base}/${resource}/${id}`, { method: "DELETE" });
      await loadTab("catalog");
    } catch (reason) {
      setError(messageOf(reason));
    }
  }

  async function updateOrder(order: Order, status: string) {
    setError("");
    try {
      await requestJson(`${base}/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadTab("orders");
    } catch (reason) {
      setError(messageOf(reason));
    }
  }

  return (
    <section className="manager-workspace">
      <nav className="manager-tabs" aria-label={isArabic ? "أقسام لوحة الإدارة" : "Manager sections"}>
        {tabs.map((item) => (
          <button aria-pressed={tab === item.id} key={item.id} onClick={() => setTab(item.id)} type="button">
            {isArabic ? item.ar : item.en}
          </button>
        ))}
      </nav>
      {error && <p className="manager-message manager-message-error" role="alert">{error}</p>}
      {notice && <p className="manager-message" role="status">{notice}</p>}

      {tab === "design" && (
        <form className="manager-editor" onSubmit={saveConfig}>
          <label>{isArabic ? "اسم المتجر" : "Store name"}<input maxLength={120} onChange={(event) => setConfig({ ...config, store_name: event.target.value })} required value={config.store_name} /></label>
          <label>{isArabic ? "رابط الشعار" : "Logo URL"}<input onChange={(event) => setConfig({ ...config, logo_url: event.target.value || null })} type="url" value={config.logo_url ?? ""} /></label>
          <label>{isArabic ? "اللون الأساسي" : "Primary color"}<input onChange={(event) => setConfig({ ...config, primary_color: event.target.value })} type="color" value={config.primary_color} /></label>
          <label>{isArabic ? "لون الخلفية" : "Background"}<input onChange={(event) => setConfig({ ...config, background_color: event.target.value })} type="color" value={config.background_color} /></label>
          <label>{isArabic ? "المظهر" : "Appearance"}
            <select onChange={(event) => setConfig({ ...config, mode: event.target.value as StoreConfig["mode"] })} value={config.mode}>
              <option value="light">{isArabic ? "فاتح" : "Light"}</option>
              <option value="dark">{isArabic ? "داكن" : "Dark"}</option>
            </select>
          </label>
          <label>{isArabic ? "عنوان الواجهة" : "Hero title"}<input maxLength={180} onChange={(event) => setConfig({ ...config, hero_title: event.target.value })} required value={config.hero_title} /></label>
          <label>{isArabic ? "وصف الواجهة" : "Hero subtitle"}<input maxLength={500} onChange={(event) => setConfig({ ...config, hero_subtitle: event.target.value })} value={config.hero_subtitle} /></label>
          <label>{isArabic ? "نص الزر" : "Button label"}<input maxLength={60} onChange={(event) => setConfig({ ...config, hero_cta: event.target.value })} required value={config.hero_cta} /></label>
          <fieldset className="manager-section-toggles">
            <legend>{isArabic ? "الأقسام الظاهرة" : "Visible sections"}</legend>
            {Object.entries(config.sections).map(([key, enabled]) => (
              <label key={key}>
                <input checked={enabled} onChange={(event) => setConfig({
                  ...config,
                  sections: { ...config.sections, [key]: event.target.checked },
                })} type="checkbox" />
                {key}
              </label>
            ))}
          </fieldset>
          <button className="button-link" disabled={saving} type="submit">{isArabic ? "حفظ التخصيص" : "Save customization"}</button>
        </form>
      )}

      {tab === "catalog" && (
        <div className="manager-catalog">
          <form className="manager-editor" onSubmit={saveProduct}>
            <h2>{editingProduct ? (isArabic ? "تعديل المنتج" : "Edit product") : (isArabic ? "إضافة منتج" : "Add product")}</h2>
            <label>الاسم بالعربية<input onChange={(event) => setProductForm({ ...productForm, name_ar: event.target.value })} required value={productForm.name_ar} /></label>
            <label>Product name<input onChange={(event) => setProductForm({ ...productForm, name_en: event.target.value })} required value={productForm.name_en} /></label>
            <label>{isArabic ? "السعر" : "Price"}<input min="0" onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required step="0.01" type="number" value={productForm.price} /></label>
            <label>{isArabic ? "السعر قبل الخصم" : "Old price"}<input min="0" onChange={(event) => setProductForm({ ...productForm, old_price: event.target.value })} step="0.01" type="number" value={productForm.old_price} /></label>
            <label>{isArabic ? "المخزون" : "Stock"}<input min="0" onChange={(event) => setProductForm({ ...productForm, stock_qty: event.target.value })} required type="number" value={productForm.stock_qty} /></label>
            <label>{isArabic ? "القسم" : "Category"}<select onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })} value={productForm.category_id}><option value="">—</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name_ar}</option>)}</select></label>
            <label>{isArabic ? "الخيارات، مفصولة بفاصلة" : "Variants, comma separated"}<input onChange={(event) => setProductForm({ ...productForm, variants: event.target.value })} value={productForm.variants} /></label>
            <button className="button-link" disabled={saving} type="submit">{isArabic ? "حفظ المنتج" : "Save product"}</button>
            {editingProduct !== null && <button className="button-link secondary" onClick={() => setEditingProduct(null)} type="button">{isArabic ? "إلغاء التعديل" : "Cancel edit"}</button>}
          </form>
          <form className="manager-editor manager-category-form" onSubmit={saveCategory}>
            <h2>{editingCategory ? (isArabic ? "تعديل القسم" : "Edit category") : (isArabic ? "إضافة قسم" : "Add category")}</h2>
            <label>الاسم بالعربية<input onChange={(event) => setCategoryForm({ ...categoryForm, name_ar: event.target.value })} required value={categoryForm.name_ar} /></label>
            <label>Category name<input onChange={(event) => setCategoryForm({ ...categoryForm, name_en: event.target.value })} required value={categoryForm.name_en} /></label>
            <button className="button-link secondary" disabled={saving} type="submit">{isArabic ? "حفظ القسم" : "Save category"}</button>
            {editingCategory !== null && <button className="button-link secondary" onClick={() => setEditingCategory(null)} type="button">{isArabic ? "إلغاء التعديل" : "Cancel edit"}</button>}
          </form>
          <div className="manager-record-list">
            {categories.map((category) => (
              <article className="manager-record" key={category.id}>
                <strong>{category.name_ar}</strong><span>{category.name_en}</span>
                <button className="text-button" onClick={() => {
                  setEditingCategory(category.id);
                  setCategoryForm({ name_ar: category.name_ar, name_en: category.name_en });
                }} type="button">{isArabic ? "تعديل" : "Edit"}</button>
                <button className="text-button" onClick={() => void deleteItem("categories", category.id)} type="button">{isArabic ? "حذف" : "Delete"}</button>
              </article>
            ))}
            {products.map((product) => (
              <article className="manager-record" key={product.id}>
                <strong>{product.name_ar}</strong><span>{product.name_en} · {product.price} ج.م · {product.stock_qty}</span>
                <button className="text-button" onClick={() => editProduct(product)} type="button">{isArabic ? "تعديل" : "Edit"}</button>
                <button className="text-button" onClick={() => void deleteItem("products", product.id)} type="button">{isArabic ? "حذف" : "Delete"}</button>
              </article>
            ))}
            {products.length === 0 && categories.length === 0 && <p>{isArabic ? "لا توجد منتجات أو أقسام محفوظة." : "No saved products or categories yet."}</p>}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="manager-record-list">
          {orders.map((order) => (
            <article className="manager-record" key={order.id}>
              <strong>{order.order_number} · {order.customer_name}</strong>
              <span>{order.total} ج.م</span>
              <select aria-label={isArabic ? "حالة الطلب" : "Order status"} onChange={(event) => void updateOrder(order, event.target.value)} value={order.status}>
                <option value="new">جديد</option><option value="processing">قيد التجهيز</option><option value="shipped">تم الشحن</option><option value="delivered">تم التسليم</option><option value="cancelled">ملغي</option>
              </select>
              <a className="button-link secondary" href={`https://wa.me/20${order.phone.replace(/^0/, "")}`} rel="noreferrer" target="_blank">{isArabic ? "واتساب العميل" : "WhatsApp"}</a>
            </article>
          ))}
          {orders.length === 0 && <p>{isArabic ? "لا توجد طلبات محفوظة لهذا القالب." : "No orders saved for this template."}</p>}
        </div>
      )}

      {tab === "quotes" && (
        <div className="manager-record-list">
          {quotes.map((quote) => (
            <article className="manager-record" key={quote.id}>
              <strong>{quote.name} · {quote.package_id ?? "—"}</strong>
              <span>{quote.email} · {quote.phone}</span>
              {quote.message && <p>{quote.message}</p>}
              <a className="button-link secondary" href={`https://wa.me/20${quote.phone.replace(/^0/, "")}`} rel="noreferrer" target="_blank">{isArabic ? "رد عبر واتساب" : "Reply on WhatsApp"}</a>
            </article>
          ))}
          {quotes.length === 0 && <p>{isArabic ? "لا توجد طلبات عروض أسعار حتى الآن." : "No quote requests yet."}</p>}
        </div>
      )}

      {tab === "export" && (
        <div className="manager-export-panel">
          <form className="manager-clone-form" onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setNotice("");
            try {
              const result = await requestJson<{ slug: string }>(`${base}/clone`, {
                method: "POST",
                body: JSON.stringify({ client_slug: clientSlug }),
              });
              setNotice(isArabic ? `تم إنشاء نسخة العميل: ${result.slug}` : `Client copy created: ${result.slug}`);
              setClientSlug("");
            } catch (reason) {
              setError(messageOf(reason));
            }
          }}>
            <label>{isArabic ? "معرّف نسخة العميل" : "Client copy slug"}<input maxLength={48} minLength={3} onChange={(event) => setClientSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required value={clientSlug} /></label>
            <button className="button-link" type="submit">{isArabic ? "نسخ القالب وبياناته" : "Clone template and data"}</button>
          </form>
          <h2>{isArabic ? "نسخ إعدادات القالب" : "Export template settings"}</h2>
          <p>
            {isArabic
              ? "يتضمن الملف إعدادات المتجر ووحدة القالب المصدر؛ يلزم ربطه بتطبيق CommerceForge/Next.js لتشغيله."
              : "The ZIP contains store settings and the template source module; connect it to a CommerceForge/Next.js app to run it."}
          </p>
          <a className="button-link" href={`${base}/export`}>
            {isArabic ? "تنزيل حزمة القالب ZIP" : "Download template ZIP"}
          </a>
        </div>
      )}
    </section>
  );
}
