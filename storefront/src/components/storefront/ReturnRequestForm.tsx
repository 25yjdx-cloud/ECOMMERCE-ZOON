"use client";

import { useState, type FormEvent } from "react";
import type { MockLocale } from "@/mock/types";

export function ReturnRequestForm({
  slug,
  locale,
}: {
  slug: string;
  locale: MockLocale;
}) {
  const isArabic = locale === "ar";
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/stores/${encodeURIComponent(slug)}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber.trim(),
          phone: phone.replace(/\s+/g, ""),
          reason: reason.trim(),
        }),
      });
      if (!response.ok) {
        setError(response.status === 404
          ? (isArabic ? "لم يتم العثور على طلب بهذه البيانات." : "No order matched those details.")
          : (isArabic ? "تعذر إرسال الطلب. تحقق من البيانات وحاول مجدداً." : "Could not submit the request. Check the details and retry."));
        return;
      }

      setMessage(isArabic ? "تم استلام طلب الاستبدال أو الاسترجاع." : "Your return request has been received.");
      setOrderNumber("");
      setPhone("");
      setReason("");
    } catch (requestError) {
      if (!(requestError instanceof TypeError)) throw requestError;
      setError(isArabic ? "تعذر الاتصال بالخادم. حاول لاحقاً." : "The service is unavailable. Try again later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form return-request-form" onSubmit={submit}>
      <label>
        {isArabic ? "رقم الطلب" : "Order number"}
        <input maxLength={32} minLength={6} onChange={(event) => setOrderNumber(event.target.value)} required value={orderNumber} />
      </label>
      <label>
        {isArabic ? "رقم الهاتف المستخدم في الطلب" : "Phone used at checkout"}
        <input autoComplete="tel" inputMode="tel" pattern="01[0125][0-9]{8}" onChange={(event) => setPhone(event.target.value)} required value={phone} />
      </label>
      <label>
        {isArabic ? "سبب الاستبدال أو الاسترجاع" : "Return or exchange reason"}
        <textarea maxLength={1000} minLength={8} onChange={(event) => setReason(event.target.value)} required rows={4} value={reason} />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {message && <p className="auth-notice" role="status">{message}</p>}
      <button className="button-link" disabled={pending} type="submit">
        {pending ? (isArabic ? "جارٍ الإرسال..." : "Submitting...") : (isArabic ? "إرسال الطلب" : "Submit request")}
      </button>
    </form>
  );
}
