"use client";

import { useState, type FormEvent } from "react";
import { EGYPTIAN_GOVERNORATES, createMockOrderNumber, validateCheckoutDetails, type CheckoutDetails, type CheckoutErrors } from "@/features/checkout/validation";
import type { MockLocale } from "@/mock/types";
import { useCart } from "./CartProvider";

type CheckoutFormProps = {
  locale: MockLocale;
};

const initialDetails: CheckoutDetails = {
  name: "",
  phone: "",
  governorate: "",
  address: "",
};

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const isArabic = locale === "ar";
  const { items, subtotal, clear } = useCart();
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [orderNumber, setOrderNumber] = useState<string>();

  function updateField(field: keyof CheckoutDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateCheckoutDetails(details);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setOrderNumber(createMockOrderNumber());
    clear();
  }

  if (orderNumber) {
    return (
      <section className="order-confirmation" role="status">
        <span className="eyebrow">{isArabic ? "انتهت التجربة" : "Demo complete"}</span>
        <h1>{isArabic ? "تم إنشاء طلب تجريبي" : "Mock order created"}</h1>
        <p>{isArabic ? "لم يتم إرسال الطلب أو مشاركة بياناتك مع أي خدمة." : "Nothing was submitted or shared with a service."}</p>
        <strong>{orderNumber}</strong>
        <p className="mock-warning">MOCK - no order is sent</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="empty-state">
        <h1>{isArabic ? "سلة التسوق فارغة" : "Your cart is empty"}</h1>
        <p>{isArabic ? "أضف منتجًا قبل تجربة إتمام الطلب." : "Add a product before trying the checkout."}</p>
      </section>
    );
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <p className="mock-warning">MOCK - no order is sent</p>
      <label>
        <span>{isArabic ? "الاسم" : "Name"}</span>
        <input autoComplete="name" value={details.name} onChange={(event) => updateField("name", event.currentTarget.value)} />
        {errors.name && <small className="field-error">{isArabic ? "اكتب اسمًا من حرفين على الأقل." : errors.name}</small>}
      </label>
      <label>
        <span>{isArabic ? "رقم الهاتف المصري" : "Egyptian mobile number"}</span>
        <input autoComplete="tel" inputMode="tel" value={details.phone} onChange={(event) => updateField("phone", event.currentTarget.value)} />
        {errors.phone && <small className="field-error">{isArabic ? "اكتب رقم هاتف مصريًا صحيحًا." : errors.phone}</small>}
      </label>
      <label>
        <span>{isArabic ? "المحافظة" : "Governorate"}</span>
        <select value={details.governorate} onChange={(event) => updateField("governorate", event.currentTarget.value)}>
          <option value="">{isArabic ? "اختر المحافظة" : "Select governorate"}</option>
          {EGYPTIAN_GOVERNORATES.map((governorate) => (
            <option key={governorate} value={governorate}>{governorate}</option>
          ))}
        </select>
        {errors.governorate && <small className="field-error">{isArabic ? "اختر محافظة مصرية." : errors.governorate}</small>}
      </label>
      <label>
        <span>{isArabic ? "العنوان بالتفصيل" : "Full address"}</span>
        <textarea autoComplete="street-address" rows={3} value={details.address} onChange={(event) => updateField("address", event.currentTarget.value)} />
        {errors.address && <small className="field-error">{isArabic ? "اكتب عنوانًا من خمسة أحرف على الأقل." : errors.address}</small>}
      </label>
      <fieldset className="payment-choice">
        <legend>{isArabic ? "طريقة الدفع" : "Payment method"}</legend>
        <label><input type="radio" name="payment" value="cod" checked readOnly /> {isArabic ? "الدفع نقدًا عند الاستلام" : "Cash on delivery"}</label>
      </fieldset>
      <div className="checkout-total">
        <span>{isArabic ? "الإجمالي التجريبي" : "Mock total"}</span>
        <strong>{subtotal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {isArabic ? "ج.م" : "EGP"}</strong>
      </div>
      <button className="button-link" type="submit">{isArabic ? "إنشاء طلب تجريبي" : "Create mock order"}</button>
      <small>{isArabic ? "هذا نموذج توضيحي فقط ولا يرسل طلبًا لأي جهة." : "Demo only. This form does not submit an order."}</small>
    </form>
  );
}
