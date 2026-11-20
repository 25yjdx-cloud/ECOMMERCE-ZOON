"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { EGYPTIAN_GOVERNORATES } from "@/features/checkout/validation";
import type { MemberRole } from "@/lib/auth";

type StoreConfig = {
  store_name?: string;
  logo_url?: string | null;
  primary_color?: string;
  meta_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  whatsapp?: string;
  plan?: string;
  hosting_mode?: "saas" | "client_hosting";
  domain_mode?: "subdomain" | "custom";
  domain?: string | null;
  custom_domain_status?: string;
  build_completion?: number;
  developer_refinement_status?: "pending" | "in_progress" | "delivered";
};

type StoreMetadata = {
  slug: string;
  templateSlug: string;
  config: StoreConfig;
  paused?: boolean;
  trial_ends_at?: string | null;
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
  governorate?: string;
  address?: string;
  total: number;
  shipping_requires_approval?: boolean;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  items?: string | OrderItem[] | null;
  shipment?: {
    id: number;
    provider: "bosta" | "oto" | "manual";
    tracking_number: string | null;
    status: string;
    label_url: string | null;
  } | null;
};

type OrderItem = { product_id: number; quantity: number; name_ar?: string; name_en?: string };
type ShippingSettings = {
  requires_approval: boolean;
  rates: Array<{ governorate: string; fee: number }>;
};
type ShippingProvider = "bosta" | "oto" | "manual";
type ShippingIntegration = {
  provider: ShippingProvider;
  enabled: boolean;
  configured: boolean;
  business_location_id: string | null;
  package_type: string | null;
  delivery_option_id: string | null;
  pickup_location_code: string | null;
  sender_name: string | null;
  webhook_url: string;
};
type Shipment = NonNullable<Order["shipment"]> & {
  label_data: string | null;
  label_mime_type: string | null;
};
type ApiResponse<T> = { data: T };
type Section = "analytics" | "branding" | "products" | "orders" | "shipping" | "domain";
type DashboardCopy = {
  analytics: string;
  branding: string;
  products: string;
  orders: string;
  shipping: string;
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
  printWaybill: string;
  activePlan: string;
  freePlan: string;
  domainLabel: string;
  domainStatus: string;
  pending: string;
  active: string;
  none: string;
  hostingMode: string;
  platformHosting: string;
  clientHosting: string;
  refinement: string;
  pendingRefinement: string;
  inProgressRefinement: string;
  deliveredRefinement: string;
  preview: string;
  refresh: string;
  states: Record<Order["status"], string>;
  metaPixelId: string;
  tiktokPixelId: string;
  shippingProvider: string;
  apiKey: string;
  businessLocationId: string;
  packageType: string;
  deliveryOptionId: string;
  pickupLocationCode: string;
  senderName: string;
  enableProvider: string;
  saveProvider: string;
  createShipment: string;
  openLabel: string;
  trackingNumber: string;
  webhookUrl: string;
  configured: string;
};

const copy = {
  ar: {
    analytics: "مؤشرات المتجر",
    branding: "تخصيص الهوية",
    products: "منتجاتي",
    orders: "طلباتي",
    shipping: "إعدادات الشحن المعتمدة",
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
    printWaybill: "طباعة بوليصة الشحن",
    activePlan: "الباقة الحالية",
    freePlan: "البداية — مجانية",
    domainLabel: "عنوان المتجر",
    domainStatus: "حالة طلب الدومين الخاص",
    pending: "قيد المراجعة",
    active: "نشط",
    none: "لا يوجد طلب دومين خاص",
    hostingMode: "نوع الاستضافة",
    platformHosting: "استضافة المنصة",
    clientHosting: "استضافة العميل",
    refinement: "حالة المراجعة والتسليم",
    pendingRefinement: "بانتظار مراجعة المطور",
    inProgressRefinement: "مراجعة وتظبيط جارٍ",
    deliveredRefinement: "تم التأكيد والتسليم النهائي",
    preview: "معاينة متجري",
    refresh: "تحديث البيانات",
    metaPixelId: "معرّف Meta Pixel",
    tiktokPixelId: "معرّف TikTok Pixel",
    shippingProvider: "شركة الشحن",
    apiKey: "مفتاح API",
    businessLocationId: "معرّف موقع Bosta",
    packageType: "نوع الطرد",
    deliveryOptionId: "معرّف خيار توصيل OTO",
    pickupLocationCode: "رمز موقع الاستلام في OTO",
    senderName: "اسم المرسل",
    enableProvider: "تفعيل الربط",
    saveProvider: "حفظ إعدادات شركة الشحن",
    createShipment: "إنشاء بوليصة الشحن",
    openLabel: "فتح البوليصة",
    trackingNumber: "رقم التتبع",
    webhookUrl: "رابط تحديثات التوصيل",
    configured: "مُعد",
    states: { new: "جديد", processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" },
  },
  en: {
    analytics: "Store analytics",
    branding: "Branding",
    products: "My products",
    orders: "My orders",
    shipping: "Approved shipping settings",
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
    printWaybill: "Print shipping waybill",
    activePlan: "Current plan",
    freePlan: "Starter — Free",
    domainLabel: "Store address",
    domainStatus: "Custom domain request status",
    pending: "Under review",
    active: "Active",
    none: "No custom-domain request",
    hostingMode: "Hosting type",
    platformHosting: "Platform hosting",
    clientHosting: "Client hosting",
    refinement: "Review and delivery status",
    pendingRefinement: "Waiting for developer review",
    inProgressRefinement: "Refinement in progress",
    deliveredRefinement: "Final delivery confirmed",
    preview: "Preview my store",
    refresh: "Refresh data",
    metaPixelId: "Meta Pixel ID",
    tiktokPixelId: "TikTok Pixel ID",
    shippingProvider: "Shipping provider",
    apiKey: "API key",
    businessLocationId: "Bosta business location ID",
    packageType: "Package type",
    deliveryOptionId: "OTO delivery option ID",
    pickupLocationCode: "OTO pickup location code",
    senderName: "Sender name",
    enableProvider: "Enable integration",
    saveProvider: "Save shipping integration",
    createShipment: "Create shipping label",
    openLabel: "Open label",
    trackingNumber: "Tracking number",
    webhookUrl: "Delivery update webhook URL",
    configured: "Configured",
    states: { new: "New", processing: "Preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" },
  },
} satisfies Record<MockLocale, DashboardCopy>;

const apiBase = (slug: string) => `/api/manager/${encodeURIComponent(slug)}`;

function parseOrderItems(value: Order["items"]): OrderItem[] {
  if (!value) return [];
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed)) throw new Error("Order items returned an invalid format.");

  return parsed.map((item) => {
    if (
      !item
      || typeof item !== "object"
      || !("product_id" in item)
      || typeof item.product_id !== "number"
      || !("quantity" in item)
      || typeof item.quantity !== "number"
    ) {
      throw new Error("Order items returned an invalid format.");
    }

    return {
      product_id: item.product_id,
      quantity: item.quantity,
      name_ar: "name_ar" in item && typeof item.name_ar === "string" ? item.name_ar : undefined,
      name_en: "name_en" in item && typeof item.name_en === "string" ? item.name_en : undefined,
    };
  });
}

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

export function MerchantStoreDashboard({
  slug,
  locale,
  memberRole,
}: {
  slug: string;
  locale: MockLocale;
  memberRole: MemberRole | null;
}) {
  const text = copy[locale];
  const [section, setSection] = useState<Section>(
    memberRole === "staff" || memberRole === "order_manager" ? "orders" : "branding",
  );
  const [store, setStore] = useState<StoreMetadata>();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>();
  const [shippingIntegrations, setShippingIntegrations] = useState<ShippingIntegration[]>([]);
  const [shippingProvider, setShippingProvider] = useState<ShippingProvider>("manual");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingApiKey, setShippingApiKey] = useState("");
  const [businessLocationId, setBusinessLocationId] = useState("");
  const [packageType, setPackageType] = useState("SMALL");
  const [deliveryOptionId, setDeliveryOptionId] = useState("");
  const [pickupLocationCode, setPickupLocationCode] = useState("");
  const [senderName, setSenderName] = useState("");
  const [manualTrackingNumbers, setManualTrackingNumbers] = useState<Record<number, string>>({});
  const [shippingApproval, setShippingApproval] = useState(false);
  const [shippingRates, setShippingRates] = useState<Record<string, string>>({});
  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#D9541E");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
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
    try {
      const base = apiBase(slug);
      const [storeResult, productsResult, ordersResult, shippingResult, integrationsResult] = await Promise.all([
        requestJson<ApiResponse<StoreMetadata>>(`${base}/config`),
        requestJson<ApiResponse<Product[]>>(`${base}/products`),
        requestJson<ApiResponse<Order[]>>(`${base}/orders`),
        requestJson<ApiResponse<ShippingSettings>>(`${base}/shipping-rates`),
        requestJson<ApiResponse<ShippingIntegration[]>>(`${base}/shipping/integrations`),
      ]);
      setError("");
      setStore(storeResult.data);
      setProducts(productsResult.data);
      setOrders(ordersResult.data);
      setShippingSettings(shippingResult.data);
      setShippingIntegrations(integrationsResult.data);
      const activeIntegration = integrationsResult.data.find(
        (integration) => integration.provider !== "manual" && integration.enabled,
      );
      setShippingProvider(activeIntegration?.provider ?? "manual");
      setShippingEnabled(activeIntegration?.enabled ?? true);
      setBusinessLocationId(activeIntegration?.business_location_id ?? "");
      setPackageType(activeIntegration?.package_type ?? "SMALL");
      setDeliveryOptionId(activeIntegration?.delivery_option_id ?? "");
      setPickupLocationCode(activeIntegration?.pickup_location_code ?? "");
      setSenderName(activeIntegration?.sender_name ?? "");
      setShippingApproval(shippingResult.data.requires_approval);
      setShippingRates(Object.fromEntries(
        shippingResult.data.rates.map((rate) => [rate.governorate, String(rate.fee)]),
      ));
      setStoreName(storeResult.data.config.store_name ?? "");
      setLogoUrl(storeResult.data.config.logo_url ?? "");
      setPrimaryColor(storeResult.data.config.primary_color ?? "#D9541E");
      setMetaPixelId(storeResult.data.config.meta_pixel_id ?? "");
      setTiktokPixelId(storeResult.data.config.tiktok_pixel_id ?? "");
      setWhatsapp(storeResult.data.config.whatsapp ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.loadError);
    } finally {
      setLoading(false);
    }
  }, [slug, text.loadError]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const refreshData = useCallback(() => {
    setLoading(true);
    setError("");
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
  const analytics = useMemo(() => {
    const completedOrders = orders.filter((order) => order.status !== "cancelled");
    const sales = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const soldUnits = new Map<number, number>();
    for (const order of completedOrders) {
      for (const item of parseOrderItems(order.items)) {
        soldUnits.set(item.product_id, (soldUnits.get(item.product_id) ?? 0) + item.quantity);
      }
    }
    const topProducts = [...soldUnits.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([productId, quantity]) => ({
        product: products.find((item) => item.id === productId),
        quantity,
      }))
      .filter((item): item is { product: Product; quantity: number } => item.product !== undefined);

    return {
      sales,
      orderCount: orders.length,
      averageOrder: completedOrders.length ? sales / completedOrders.length : 0,
      lowStockCount: products.filter((product) => product.stock_qty <= 3).length,
      topProducts,
    };
  }, [orders, products]);

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
          meta_pixel_id: metaPixelId || null,
          tiktok_pixel_id: tiktokPixelId || null,
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

  async function saveShipping(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    try {
      const rates = EGYPTIAN_GOVERNORATES.map(({ id }) => ({
        governorate: id,
        fee: Number(shippingRates[id]),
      }));
      if (rates.some(({ fee }) => !Number.isFinite(fee) || fee < 0)) {
        throw new Error(locale === "ar" ? "أدخل رسوم شحن صحيحة لكل محافظة." : "Enter a valid shipping fee for every governorate.");
      }

      const result = await requestJson<ApiResponse<ShippingSettings>>(`${apiBase(slug)}/shipping-rates`, {
        method: "PUT",
        body: JSON.stringify({ requires_approval: shippingApproval, rates }),
      });
      setShippingSettings(result.data);
      setNotice(text.saved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.loadError);
    } finally {
      setPending(false);
    }
  }

  function selectShippingProvider(provider: ShippingProvider) {
    const integration = shippingIntegrations.find((item) => item.provider === provider);
    setShippingProvider(provider);
    setShippingEnabled(integration?.enabled ?? provider === "manual");
    setBusinessLocationId(integration?.business_location_id ?? "");
    setPackageType(integration?.package_type ?? "SMALL");
    setDeliveryOptionId(integration?.delivery_option_id ?? "");
    setPickupLocationCode(integration?.pickup_location_code ?? "");
    setSenderName(integration?.sender_name ?? "");
    setShippingApiKey("");
  }

  async function saveShippingIntegration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    try {
      const result = await requestJson<ApiResponse<ShippingIntegration[]>>(`${apiBase(slug)}/shipping/integrations`, {
        method: "PUT",
        body: JSON.stringify({
          provider: shippingProvider,
          enabled: shippingEnabled,
          ...(shippingApiKey ? { api_key: shippingApiKey } : {}),
          business_location_id: businessLocationId,
          package_type: packageType,
          delivery_option_id: deliveryOptionId,
          pickup_location_code: pickupLocationCode,
          sender_name: senderName,
        }),
      });
      setShippingIntegrations(result.data);
      setShippingApiKey("");
      setNotice(text.saved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.loadError);
    } finally {
      setPending(false);
    }
  }

  async function createShipment(order: Order) {
    setPending(true);
    setError("");
    setNotice("");

    try {
      const shipmentResult = await requestJson<ApiResponse<Shipment>>(
        `${apiBase(slug)}/orders/${order.id}/shipments`,
        {
          method: "POST",
          body: JSON.stringify({
            provider: shippingProvider,
            ...(shippingProvider === "manual" ? {
              tracking_number: manualTrackingNumbers[order.id] ?? "",
            } : {}),
          }),
        },
      );
      const shipment = shipmentResult.data;
      if (shipment.label_data) {
        const bytes = Uint8Array.from(atob(shipment.label_data), (character) => character.charCodeAt(0));
        const objectUrl = URL.createObjectURL(new Blob([bytes], { type: shipment.label_mime_type ?? "application/pdf" }));
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${order.order_number.replace(/[^A-Za-z0-9_-]/g, "")}-shipping-label.pdf`;
        link.click();
        URL.revokeObjectURL(objectUrl);
      }
      setNotice(text.saved);
      await load();
    } catch (shipmentError) {
      setError(shipmentError instanceof Error ? shipmentError.message : text.loadError);
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

  function printWaybill(order: Order) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError(locale === "ar" ? "اسمح بفتح النوافذ المنبثقة لطباعة البوليصة." : "Allow pop-ups to print the waybill.");
      return;
    }

    printWindow.opener = null;
    const printDocument = printWindow.document;
    printDocument.title = order.order_number;
    const style = printDocument.createElement("style");
    style.textContent = "@page{size:A6 portrait;margin:8mm}body{font:14px Arial,sans-serif;color:#111;padding:8px}.print-brand{display:flex;align-items:center;gap:8px;color:#1A1918;font-weight:800}.print-brand svg{width:30px;height:30px}h1{font-size:20px;border-bottom:1px solid #111;padding-bottom:8px}p{margin:10px 0}.total{font-size:18px;font-weight:bold;border-top:1px solid #111;padding-top:10px}";
    const content = printDocument.createElement("main");
    const printBrand = printDocument.createElement("div");
    printBrand.className = "print-brand";
    const svgNamespace = "http://www.w3.org/2000/svg";
    const mark = printDocument.createElementNS(svgNamespace, "svg");
    mark.setAttribute("viewBox", "0 0 64 64");
    const arch = printDocument.createElementNS(svgNamespace, "path");
    arch.setAttribute("d", "M8 57V28C8 14.745 18.745 4 32 4s24 10.745 24 24v29H44V28c0-6.627-5.373-12-12-12s-12 5.373-12 12v29H8Z");
    arch.setAttribute("fill", "#1A1918");
    const forge = printDocument.createElementNS(svgNamespace, "path");
    forge.setAttribute("d", "M15 34h12l4-7h9l5 8 7 3-5 7H36l-4 9-5-9h-8l-5-11Z");
    forge.setAttribute("fill", "#D9541E");
    mark.append(arch, forge);
    printBrand.append(mark, printDocument.createTextNode("CommerceForge"));
    content.append(printBrand);
    const title = printDocument.createElement("h1");
    title.textContent = `${storeName || "CommerceForge"} · ${order.order_number}`;
    content.append(title);
    for (const [label, value] of [
      [locale === "ar" ? "العميل" : "Customer", order.customer_name],
      [locale === "ar" ? "الهاتف" : "Phone", order.phone],
      [locale === "ar" ? "المحافظة" : "Governorate", order.governorate ?? ""],
      [locale === "ar" ? "العنوان" : "Address", order.address ?? ""],
    ]) {
      const line = printDocument.createElement("p");
      line.textContent = `${label}: ${value}`;
      content.append(line);
    }
    const total = printDocument.createElement("p");
    total.className = "total";
    total.textContent = `${locale === "ar" ? "الإجمالي عند الاستلام" : "COD total"}: ${formattedOrderTotal.format(Number(order.total))}`;
    content.append(total);
    printDocument.head.append(style);
    printDocument.body.replaceChildren(content);
    printWindow.focus();
    printWindow.print();
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
  const effectiveRole = memberRole === "order_manager" ? "staff" : memberRole ?? "staff";
  const sections: Section[] = effectiveRole === "staff"
    ? ["orders"]
    : effectiveRole === "manager"
      ? ["analytics", "branding", "products", "orders", "shipping"]
      : ["analytics", "branding", "products", "orders", "shipping", "domain"];

  return (
    <section className="merchant-workspace">
      <nav aria-label={locale === "ar" ? "إدارة المتجر" : "Store management"} className="merchant-tabs">
        {sections.map((item) => (
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
          <button className="text-button" disabled={loading || pending} onClick={refreshData} type="button">
            {text.refresh}
          </button>
        </div>
        {loading && <p className="merchant-loading-state" role="status"><BrandLogo size={32} variant="animated" />{text.loading}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-notice merchant-status-banner" role="status"><BrandLogo size={20} variant="mark" />{notice}</p>}
        {!loading && store?.trial_ends_at && (
          <p className={`merchant-status-banner${store.paused ? " auth-error" : " auth-notice"}`} role="status">
            {store.paused
              ? locale === "ar"
                ? "انتهت تجربتك المجانية وتوقف المتجر مؤقتاً. بياناتك محفوظة؛ تواصل مع المطور لتجديد الاشتراك."
                : "Your free trial ended and the store is paused. Your data is saved; contact the developer to renew."
              : locale === "ar"
                ? `متبقي في تجربتك المجانية حتى ${new Date(store.trial_ends_at).toLocaleDateString("ar-EG")}.`
                : `Your free trial is active until ${new Date(store.trial_ends_at).toLocaleDateString("en-US")}.`}
          </p>
        )}

        {!loading && section === "analytics" && (
          <div className="merchant-analytics-grid merchant-branded-panel">
            <BrandLogo className="merchant-panel-watermark" size={160} variant="watermark" />
            <article className="merchant-branded-kpi"><BrandLogo size={24} variant="mark" /><span>{locale === "ar" ? "إجمالي المبيعات" : "Total sales"}</span><strong>{formattedOrderTotal.format(analytics.sales)}</strong></article>
            <article><span>{locale === "ar" ? "عدد الطلبات" : "Order count"}</span><strong>{analytics.orderCount}</strong></article>
            <article><span>{locale === "ar" ? "متوسط قيمة السلة" : "Average basket value"}</span><strong>{formattedOrderTotal.format(analytics.averageOrder)}</strong></article>
            <article><span>{locale === "ar" ? "تنبيه مخزون منخفض (٣ قطع أو أقل)" : "Low stock (3 or fewer)"}</span><strong>{analytics.lowStockCount}</strong></article>
            <article className="merchant-top-products">
              <span>{locale === "ar" ? "المنتجات الأكثر طلباً" : "Top products"}</span>
              {analytics.topProducts.length ? analytics.topProducts.map(({ product, quantity }) => (
                <strong key={product.id}>
                  {locale === "ar" ? product.name_ar : product.name_en} · {quantity}
                </strong>
              )) : <p>{locale === "ar" ? "لا توجد بيانات طلبات كافية بعد." : "No order item data yet."}</p>}
            </article>
          </div>
        )}

        {!loading && section === "branding" && (
          <form className="auth-form merchant-form-grid" onSubmit={saveBranding}>
            {logoUrl && <div className="merchant-logo-preview"><span>{locale === "ar" ? "معاينة الشعار" : "Logo preview"}</span><Image alt={locale === "ar" ? "شعار المتجر الحالي" : "Current store logo"} height={48} src={logoUrl} unoptimized width={48} /></div>}
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
            <label>
              {text.metaPixelId}
              <input
                autoComplete="off"
                maxLength={64}
                onChange={(event) => setMetaPixelId(event.target.value)}
                pattern="[A-Za-z0-9_-]{1,64}"
                value={metaPixelId}
              />
            </label>
            <label>
              {text.tiktokPixelId}
              <input
                autoComplete="off"
                maxLength={64}
                onChange={(event) => setTiktokPixelId(event.target.value)}
                pattern="[A-Za-z0-9_-]{1,64}"
                value={tiktokPixelId}
              />
            </label>
            <button className="button-link" disabled={pending} type="submit">{text.save}</button>
          </form>
        )}

        {!loading && section === "products" && (
          <>
            <div className="merchant-stock-note">
              <BrandLogo size={24} variant="mark" />
              <span>{locale === "ar"
                ? "تنبيهات الكمية الحالية: يظهر المنتج هنا عند بقاء 3 قطع أو أقل. إدارة المقاسات والمخزون لكل متغير غير متاحة بعد."
                : "Current stock alerts: products with 3 or fewer units are highlighted. Per-size/color variant inventory is not available yet."}</span>
            </div>
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
            {products.length === 0 ? <div className="merchant-empty-state"><BrandLogo size={42} variant="mark" /><p>{text.noProducts}</p></div> : (
              <div className="merchant-product-list">
                {products.map((product) => (
                  <article className="merchant-product-row" key={product.id}>
                    <div>
                      <BrandLogo size={22} variant="mark" />
                      <strong>{locale === "ar" ? product.name_ar : product.name_en}</strong>
                      <span>{formattedOrderTotal.format(Number(product.price))} · {product.stock_qty}</span>
                      {product.stock_qty <= 3 && <span className="merchant-low-stock">{locale === "ar" ? `متبقي ${product.stock_qty} قطع` : `${product.stock_qty} left`}</span>}
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
          orders.length === 0 ? <div className="merchant-empty-state"><BrandLogo size={42} variant="mark" /><p>{text.noOrders}</p></div> : (
            <div className="merchant-order-list">
              {orders.map((order) => (
                <article className="merchant-order-row" key={order.id}>
                  <div>
                    <strong>{order.order_number}</strong>
                    <span>{order.customer_name} · {formattedOrderTotal.format(Number(order.total))}</span>
                    {order.shipment?.tracking_number && (
                      <span>{text.trackingNumber}: {order.shipment.tracking_number} · {order.shipment.status}</span>
                    )}
                    {order.shipping_requires_approval && (
                      <span>{locale === "ar" ? "الشحن بانتظار الاتفاق والموافقة" : "Shipping awaits agreement and approval"}</span>
                    )}
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
                  {order.shipment?.label_url && (
                    <a className="button-link secondary" href={order.shipment.label_url} rel="noreferrer" target="_blank">
                      {text.openLabel}
                    </a>
                  )}
                  {!order.shipment && (
                    <>
                      {shippingProvider === "manual" && (
                        <input
                          aria-label={`${text.trackingNumber} ${order.order_number}`}
                          onChange={(event) => setManualTrackingNumbers((previous) => ({
                            ...previous,
                            [order.id]: event.currentTarget.value,
                          }))}
                          placeholder={text.trackingNumber}
                          value={manualTrackingNumbers[order.id] ?? ""}
                        />
                      )}
                      <button
                        className="button-link secondary"
                        disabled={pending
                          || (shippingProvider === "manual" && !manualTrackingNumbers[order.id]?.trim())
                          || (
                          shippingProvider !== "manual"
                          && !shippingIntegrations.some((integration) =>
                            integration.provider === shippingProvider && integration.enabled && integration.configured)
                          )}
                        onClick={() => void createShipment(order)}
                        type="button"
                      >
                        {text.createShipment}
                      </button>
                    </>
                  )}
                  <button className="button-link secondary" onClick={() => printWaybill(order)} type="button">
                    {text.printWaybill}
                  </button>
                </article>
              ))}
            </div>
          )
        )}

        {!loading && section === "shipping" && shippingSettings && (
          <form className="auth-form merchant-shipping-form" onSubmit={saveShipping}>
            <label className="merchant-shipping-toggle">
              <input
                checked={shippingApproval}
                onChange={(event) => setShippingApproval(event.currentTarget.checked)}
                type="checkbox"
              />
              <span>{locale === "ar" ? "يُحدد ويُعتمد مع شركة الشحن أولاً" : "Agree with the shipping carrier first"}</span>
            </label>
            <p className="shipping-agreement-note">
              {locale === "ar"
                ? "لا تُضاف رسوم شحن إلى الطلب عند تفعيل هذا الخيار؛ يعتمد التاجر التكلفة مع شركة الشحن وموافقة العميل."
                : "No shipping fee is added to orders while enabled; agree on the cost with the carrier and customer."}
            </p>
            {!shippingApproval && (
              <div className="merchant-shipping-rates">
                {EGYPTIAN_GOVERNORATES.map((governorate) => (
                  <label key={governorate.id}>
                    <span>{governorate.name[locale]}</span>
                    <input
                      min="0"
                      onChange={(event) => setShippingRates((previous) => ({
                        ...previous,
                        [governorate.id]: event.currentTarget.value,
                      }))}
                      required
                      step="0.01"
                      type="number"
                      value={shippingRates[governorate.id] ?? ""}
                    />
                  </label>
                ))}
              </div>
            )}
            <button className="button-link" disabled={pending} type="submit">
              {locale === "ar" ? "حفظ إعدادات الشحن" : "Save shipping settings"}
            </button>
          </form>
        )}
        {!loading && section === "shipping" && (
          <form className="auth-form merchant-shipping-form" onSubmit={saveShippingIntegration}>
            <label>
              {text.shippingProvider}
              <select onChange={(event) => selectShippingProvider(event.target.value as ShippingProvider)} value={shippingProvider}>
                <option value="manual">{locale === "ar" ? "شحن يدوي" : "Manual shipping"}</option>
                <option value="bosta">Bosta</option>
                <option value="oto">OTO</option>
              </select>
            </label>
            {shippingProvider !== "manual" ? (
              <>
                <label>
                  {text.apiKey}
                  <input
                    autoComplete="new-password"
                    onChange={(event) => setShippingApiKey(event.target.value)}
                    placeholder={locale === "ar" ? "اتركه فارغاً للاحتفاظ بالمفتاح الحالي" : "Leave blank to keep the current key"}
                    type="password"
                    value={shippingApiKey}
                  />
                </label>
                {shippingProvider === "bosta" ? (
                  <>
                    <label>
                      {text.businessLocationId}
                      <input onChange={(event) => setBusinessLocationId(event.target.value)} required value={businessLocationId} />
                    </label>
                    <label>
                      {text.packageType}
                      <select onChange={(event) => setPackageType(event.target.value)} value={packageType}>
                        {["SMALL", "MEDIUM", "LARGE", "Light Bulky", "Heavy Bulky"].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      {text.deliveryOptionId}
                      <input onChange={(event) => setDeliveryOptionId(event.target.value)} required value={deliveryOptionId} />
                    </label>
                    <label>
                      {text.pickupLocationCode}
                      <input onChange={(event) => setPickupLocationCode(event.target.value)} required value={pickupLocationCode} />
                    </label>
                    <label>
                      {text.senderName}
                      <input onChange={(event) => setSenderName(event.target.value)} required value={senderName} />
                    </label>
                  </>
                )}
                <label className="merchant-shipping-toggle">
                  <input checked={shippingEnabled} onChange={(event) => setShippingEnabled(event.target.checked)} type="checkbox" />
                  <span>{text.enableProvider}</span>
                </label>
                <p>{shippingIntegrations.some((integration) => integration.provider === shippingProvider && integration.configured)
                  ? `${text.configured}: ${shippingProvider}`
                  : locale === "ar" ? "أدخل بيانات الربط لتفعيل إنشاء البوالص وتحديثات التوصيل." : "Configure credentials to enable labels and delivery updates."}</p>
                {shippingIntegrations.find((integration) => integration.provider === shippingProvider)?.webhook_url && (
                  <label>
                    {text.webhookUrl}
                    <input
                      readOnly
                      value={shippingIntegrations.find((integration) => integration.provider === shippingProvider)?.webhook_url}
                    />
                  </label>
                )}
              </>
            ) : (
              <p>{locale === "ar" ? "أدخل رقم التتبع يدوياً عند إنشاء بوليصة الطلب." : "Enter a tracking number when creating a manual shipment."}</p>
            )}
            <button className="button-link" disabled={pending} type="submit">{text.saveProvider}</button>
          </form>
        )}

        {!loading && section === "domain" && (
          <div className="merchant-domain-summary">
            <p><strong>{text.activePlan}:</strong> {text.freePlan}</p>
            <p><strong>{text.hostingMode}:</strong> {store?.config.hosting_mode === "client_hosting" ? text.clientHosting : text.platformHosting}</p>
            <p><strong>{text.domainLabel}:</strong> {store?.config.domain ?? `${slug}.elmatajer.com`}</p>
            <p>
              <strong>{text.domainStatus}:</strong>{" "}
              {domainStatus === "pending" ? text.pending : domainStatus === "active" ? text.active : text.none}
            </p>
            <p>
              <strong>{text.refinement}:</strong>{" "}
              {store?.config.developer_refinement_status === "delivered"
                ? text.deliveredRefinement
                : store?.config.developer_refinement_status === "in_progress"
                  ? text.inProgressRefinement
                  : text.pendingRefinement}
            </p>
            <progress max={100} value={store?.config.build_completion ?? 70}>
              {store?.config.build_completion ?? 70}%
            </progress>
          </div>
        )}
      </div>
    </section>
  );
}
