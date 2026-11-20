"use client";

import { useState, type FormEvent } from "react";
import {
  EGYPTIAN_GOVERNORATES,
  getShippingFee,
  validateCheckoutDetails,
  type CheckoutDetails,
  type CheckoutErrors,
  type GovernorateId,
} from "@/features/checkout/validation";
import { getOrderWhatsAppUrl } from "@/features/checkout/whatsapp";
import { submitCheckoutOrder } from "@/features/checkout/submit";
import { getDictionary } from "@/i18n/dictionaries";
import { formatEGP } from "@/i18n/format";
import type { MockLocale } from "@/mock/types";
import { useCart } from "./CartProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";

type CheckoutFormProps = {
  locale: MockLocale;
};

const initialDetails: CheckoutDetails = {
  name: "",
  phone: "",
  governorate: "",
  address: "",
};

function isGovernorateId(value: string): value is GovernorateId {
  return EGYPTIAN_GOVERNORATES.some(({ id }) => id === value);
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const isArabic = locale === "ar";
  const { items, subtotal, clear } = useCart();
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutDetails, boolean>>>({});
  const [orderNumber, setOrderNumber] = useState<string>();
  const [demoOrder, setDemoOrder] = useState(false);
  const [receiptCustomer, setReceiptCustomer] = useState<CheckoutDetails>();
  const [shippingRequiresApproval, setShippingRequiresApproval] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const dictionary = getDictionary(locale);
  const checkout = dictionary.checkout;
  const shippingRequiresAgreement = items.some(({ product }) => product.preset === "furniture")
    || shippingRequiresApproval;
  const shippingFee = shippingRequiresAgreement ? 0 : getShippingFee(details.governorate);
  const grandTotal = subtotal + shippingFee;

  function updateField<Field extends keyof CheckoutDetails>(
    field: Field,
    value: CheckoutDetails[Field],
  ) {
    const nextDetails = { ...details, [field]: value };
    setDetails(nextDetails);
    if (touched[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: validateCheckoutDetails(nextDetails)[field],
      }));
    }
  }

  function touchField(field: keyof CheckoutDetails) {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({
      ...previous,
      [field]: validateCheckoutDetails(details)[field],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateCheckoutDetails(details);
    setErrors(validationErrors);
    setTouched({ name: true, phone: true, governorate: true, address: true });
    setSubmitError(undefined);

    if (Object.keys(validationErrors).length > 0 || items.length === 0) return;

    setSubmitting(true);
    try {
      const result = await submitCheckoutOrder({
        storeSlug: items[0]?.product.storeSlug ?? items[0]?.product.preset ?? "",
        customer: details,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      }, true);
      setOrderNumber(result.orderNumber);
      setDemoOrder(result.demo);
      setShippingRequiresApproval(
        result.shippingRequiresApproval || items.some(({ product }) => product.preset === "furniture"),
      );
      setReceiptCustomer(details);
      clear();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : checkout.connectionError);
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <section className="order-confirmation" role="status">
        <BrandLogo size={56} variant="full" />
        <span className="eyebrow">{checkout.successTitle}</span>
        {demoOrder && <span className="demo-order-badge">{isArabic ? "طلب تجريبي" : "Demo order"}</span>}
        <h1>{checkout.successTitle}</h1>
        <p>{checkout.successText}</p>
        <strong>{orderNumber}</strong>
        {receiptCustomer && (
          <div>
            <p>{isArabic ? "العميل" : "Customer"}: {receiptCustomer.name}</p>
            <p dir="ltr">{receiptCustomer.phone}</p>
            <p>{EGYPTIAN_GOVERNORATES.find(({ id }) => id === receiptCustomer.governorate)?.name[locale]}</p>
          </div>
        )}
        {shippingRequiresAgreement && (
          <p className="shipping-agreement-note">
            {isArabic
              ? "تكلفة الشحن والنقل تُحدّد وتُعتمد مع شركة الشحن وموافقة العميل قبل التأكيد النهائي"
              : "Shipping and transport costs are agreed with the carrier and customer before final confirmation."}
          </p>
        )}
        <a
          className="button-link"
          href={getOrderWhatsAppUrl(orderNumber, checkout.whatsappMessage)}
          rel="noreferrer"
          target="_blank"
        >
          {checkout.whatsappFollowup}
        </a>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="empty-state">
        <BrandLogo size={44} variant="mark" />
        <h1>{isArabic ? "سلة التسوق فارغة" : "Your cart is empty"}</h1>
        <p>{isArabic ? "أضف منتجًا قبل تجربة إتمام الطلب." : "Add a product before trying the checkout."}</p>
      </section>
    );
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <label>
        <span>{checkout.name}</span>
        <input
          autoComplete="name"
          aria-invalid={Boolean(touched.name && errors.name)}
          className={`checkout-input${touched.name && errors.name ? " is-invalid" : ""}`}
          onBlur={() => touchField("name")}
          onChange={(event) => updateField("name", event.currentTarget.value)}
          value={details.name}
        />
        {touched.name && errors.name && <small className="field-error">{checkout.nameError}</small>}
      </label>
      <label>
        <span>{checkout.phone}</span>
        <input
          autoComplete="tel-national"
          aria-invalid={Boolean(touched.phone && errors.phone)}
          className={`checkout-input${touched.phone && errors.phone ? " is-invalid" : ""}`}
          dir="ltr"
          inputMode="numeric"
          maxLength={11}
          onBlur={() => touchField("phone")}
          onChange={(event) => updateField("phone", event.currentTarget.value.replace(/\D/g, "").slice(0, 11))}
          type="tel"
          value={details.phone}
        />
        {touched.phone && errors.phone && <small className="field-error">{checkout.phoneError}</small>}
      </label>
      <label>
        <span>{checkout.governorate}</span>
        <select
          aria-invalid={Boolean(touched.governorate && errors.governorate)}
          className={`checkout-input${touched.governorate && errors.governorate ? " is-invalid" : ""}`}
          onBlur={() => touchField("governorate")}
          onChange={(event) => {
            const value = event.currentTarget.value;
            updateField("governorate", isGovernorateId(value) ? value : "");
          }}
          value={details.governorate}
        >
          <option value="">{checkout.selectGovernorate}</option>
          {EGYPTIAN_GOVERNORATES.map((governorate) => (
            <option key={governorate.id} value={governorate.id}>
              {governorate.name[locale]} — {items.some(({ product }) => product.preset === "furniture")
                ? (isArabic ? "يُعتمد لاحقاً" : "Agreed later")
                : formatEGP(governorate.shippingFee, locale)}
            </option>
          ))}
        </select>
        {touched.governorate && errors.governorate && <small className="field-error">{checkout.governorateError}</small>}
      </label>
      <label>
        <span>{checkout.address}</span>
        <textarea
          autoComplete="street-address"
          aria-invalid={Boolean(touched.address && errors.address)}
          className={`checkout-input${touched.address && errors.address ? " is-invalid" : ""}`}
          onBlur={() => touchField("address")}
          onChange={(event) => updateField("address", event.currentTarget.value)}
          placeholder={checkout.addressPlaceholder}
          rows={3}
          value={details.address}
        />
        {touched.address && errors.address && <small className="field-error">{checkout.addressError}</small>}
      </label>
      <fieldset className="payment-choice">
        <legend>{checkout.payment}</legend>
        <label><input type="radio" name="payment" value="cod" checked readOnly /> {checkout.cashOnDelivery}</label>
      </fieldset>
      <div className="checkout-summary">
        <div><span>{checkout.subtotal}</span><strong>{formatEGP(subtotal, locale)}</strong></div>
        <div>
          <span>{checkout.shipping}</span>
          <strong>{details.governorate ? formatEGP(shippingFee, locale) : checkout.shippingNotSelected}</strong>
        </div>
        {items.some(({ product }) => product.preset === "furniture") && (
          <p className="shipping-agreement-note">
            {isArabic
              ? "تكلفة الشحن والنقل تُحدّد وتُعتمد مع شركة الشحن وموافقة العميل قبل التأكيد النهائي"
              : "Shipping and transport costs are agreed with the carrier and customer before final confirmation."}
          </p>
        )}
        <div className="checkout-grand-total">
          <span>{checkout.grandTotal}</span>
          <strong>{formatEGP(grandTotal, locale)}</strong>
        </div>
      </div>
      {submitError && <p className="checkout-submit-error" role="alert">{submitError}</p>}
      <button className="button-link" disabled={submitting} type="submit">
        {submitting ? checkout.submitting : checkout.submit}
      </button>
    </form>
  );
}
