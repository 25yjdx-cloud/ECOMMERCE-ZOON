"use client";

import { useState, type FormEvent } from "react";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";

type TrackedOrder = {
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  total: number;
  shipping_provider: "manual" | "bosta" | "oto" | null;
  shipment_status: string | null;
  tracking_number: string | null;
};

export function OrderTrackingForm({ locale, storeSlug }: { locale: MockLocale; storeSlug: string }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const ar = locale === "ar";
  const stages = ["received", "processing", "shipped", "out_for_delivery", "delivered"] as const;
  const stageIndex = (status: string | null | undefined) => {
    if (status === "out_for_delivery") return 3;
    if (status === "delivered") return 4;
    if (status === "shipped" || status === "picked_up" || status === "in_transit") return 2;
    if (status === "processing" || status === "preparing") return 1;
    return 0;
  };
  const activeStageIndex = order
    ? Math.max(stageIndex(order.status), stageIndex(order.shipment_status))
    : -1;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setOrder(undefined);
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_slug: storeSlug,
          order_number: orderNumber.trim(),
          phone: phone.replace(/\s+/g, ""),
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        setError(ar ? "تعذر العثور على طلب بهذه البيانات." : "No order matched those details.");
        return;
      }
      if (!payload || typeof payload !== "object" || !("data" in payload) || !payload.data || typeof payload.data !== "object") {
        throw new Error("Order tracking response is invalid.");
      }
      setOrder(payload.data as TrackedOrder);
    } catch (requestError) {
      if (!(requestError instanceof TypeError) && !(requestError instanceof SyntaxError)) throw requestError;
      setError(ar ? "تعذر الاتصال بالخادم. حاول لاحقاً." : "The service is unavailable. Try again later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="order-tracking-card">
      <h2>{ar ? "تتبع طلبك" : "Track your order"}</h2>
      <BrandLogo className="tracking-brand-watermark" size={108} variant="watermark" />
      <form className="auth-form" onSubmit={submit}>
        <label>{ar ? "رقم الطلب" : "Order number"}
          <input autoCapitalize="characters" maxLength={32} minLength={6} onChange={(event) => setOrderNumber(event.target.value)} required value={orderNumber} />
        </label>
        <label>{ar ? "رقم الهاتف المستخدم في الطلب" : "Phone used at checkout"}
          <input autoComplete="tel" inputMode="tel" onChange={(event) => setPhone(event.target.value)} pattern="01[0125][0-9]{8}" required value={phone} />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button-link" disabled={pending} type="submit">{pending ? (ar ? "جارٍ البحث..." : "Checking...") : (ar ? "عرض حالة الطلب" : "Check status")}</button>
      </form>
      {order && (
        <div className="order-tracking-result" role="status">
          <BrandLogo size={28} variant="mark" />
          <strong>{order.order_number}</strong>
          <span>{ar ? "الحالة" : "Status"}: {order.status}</span>
          {order.status === "cancelled" ? (
            <strong className="tracking-cancelled">{ar ? "تم إلغاء الطلب" : "Order cancelled"}</strong>
          ) : (
            <ol aria-label={ar ? "مراحل التوصيل" : "Delivery progress"} className="tracking-milestones">
              {stages.map((step, index) => (
                <li className={index <= activeStageIndex ? "is-complete" : ""} key={step}>
                  {ar
                      ? {
                          received: "تم استلام الطلب",
                          processing: "جاري التجهيز",
                          shipped: "تم التسليم لشركة الشحن",
                          out_for_delivery: "خرج للتوصيل",
                          delivered: "تم التسليم",
                        }[step]
                      : {
                          received: "Order received",
                          processing: "Preparing",
                          shipped: "Handed to carrier",
                          out_for_delivery: "Out for delivery",
                          delivered: "Delivered",
                        }[step]}
                </li>
              ))}
            </ol>
            )}
            {order.tracking_number && (
              <span>{ar ? "رقم التتبع" : "Tracking number"}: {order.tracking_number}</span>
            )}
            {order.shipping_provider && (
              <span>{ar ? "شركة الشحن" : "Carrier"}: {order.shipping_provider.toUpperCase()}</span>
            )}
            <span>{ar ? "الإجمالي" : "Total"}: {new Intl.NumberFormat(ar ? "ar-EG" : "en-US", { style: "currency", currency: "EGP" }).format(Number(order.total))}</span>
            <time dateTime={order.updated_at}>{new Date(order.updated_at).toLocaleString(ar ? "ar-EG" : "en-US")}</time>
        </div>
      )}
    </section>
  );
}
