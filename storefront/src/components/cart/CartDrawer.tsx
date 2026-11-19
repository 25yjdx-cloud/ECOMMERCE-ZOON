"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "./CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatEGP } from "@/i18n/format";
import {
  EGYPTIAN_GOVERNORATES,
  getShippingFee,
  validateCheckoutDetails,
  type CheckoutDetails,
  type CheckoutErrors,
  type GovernorateId,
} from "@/features/checkout/validation";
import { getOrderWhatsAppUrl } from "@/features/checkout/whatsapp";
import type { MockLocale } from "@/mock/types";

const emptyDetails: CheckoutDetails = { name: "", phone: "", governorate: "", address: "" };

function isGovernorateId(value: string): value is GovernorateId {
  return EGYPTIAN_GOVERNORATES.some(({ id }) => id === value);
}

export function CartDrawer({
  open,
  onClose,
  locale,
  dictionary,
}: {
  open: boolean;
  onClose: () => void;
  locale: MockLocale;
  dictionary: Dictionary;
}) {
  const { items, subtotal, setQuantity, remove, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [details, setDetails] = useState(emptyDetails);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutDetails, boolean>>>({});
  const [orderNumber, setOrderNumber] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const store = dictionary.store;
  const checkout = dictionary.checkout;
  const isArabic = locale === "ar";
  const shippingFee = getShippingFee(details.governorate);
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

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCheckoutDetails(details);
    setErrors(nextErrors);
    setTouched({ name: true, phone: true, governorate: true, address: true });
    setSubmitError(undefined);
    if (Object.keys(nextErrors).length > 0 || items.length === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: items[0]?.product.storeSlug ?? items[0]?.product.preset,
          customer: details,
          items: items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
        }),
      });

      if (!response.ok) {
        setSubmitError(checkout.connectionError);
        return;
      }

      const result: unknown = await response.json();
      if (
        typeof result !== "object" ||
        result === null ||
        !("orderNumber" in result) ||
        typeof result.orderNumber !== "string"
      ) {
        setSubmitError(checkout.connectionError);
        return;
      }

      setOrderNumber(result.orderNumber);
      clear();
    } catch (error) {
      if (error instanceof TypeError) {
        setSubmitError(checkout.connectionError);
        return;
      }

      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="cart-drawer-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="cart-drawer-title"
        aria-modal="true"
        className="cart-drawer"
        dir={isArabic ? "rtl" : "ltr"}
        lang={locale}
        role="dialog"
      >
        <div className="cart-drawer-head">
          <h2 id="cart-drawer-title">{store.cart}</h2>
          <button aria-label={store.close} className="text-button" onClick={onClose} type="button">
            {store.close}
          </button>
        </div>
        {orderNumber ? (
          <div className="cart-drawer-lines" role="status">
            <h3>{checkout.successTitle}</h3>
            <p>{checkout.successText}</p>
            <strong>{orderNumber}</strong>
            <a
              className="button-link"
              href={getOrderWhatsAppUrl(orderNumber, checkout.whatsappMessage)}
              rel="noreferrer"
              target="_blank"
            >
              {checkout.whatsappFollowup}
            </a>
          </div>
        ) : (
          <>
            <div className="cart-drawer-lines">
              {items.length === 0 ? (
                <p>{store.emptyCart}</p>
              ) : (
                items.map(({ product, quantity }) => (
                  <article className="cart-line" key={product.id}>
                    <span aria-hidden="true" className="cart-line-art">{product.name[locale].slice(0, 1)}</span>
                    <div className="cart-line-details">
                      <h3>{product.name[locale]}</h3>
                      <strong>{formatEGP(product.price, locale)}</strong>
                    </div>
                    <label className="quantity-control">
                      <span>{store.quantity}</span>
                      <input
                        min="1"
                        step="1"
                        inputMode="numeric"
                        onChange={(event) => {
                          const value = Number(event.currentTarget.value);
                          if (Number.isInteger(value) && value >= 1) {
                            setQuantity(product.id, value);
                          }
                        }}
                        type="number"
                        value={quantity}
                      />
                    </label>
                    <button className="text-button" onClick={() => remove(product.id)} type="button">
                      {store.remove}
                    </button>
                  </article>
                ))
              )}
            </div>
            <div className="cart-drawer-foot">
              <div className="checkout-summary">
                <div>
                  <span>{checkout.subtotal}</span>
                  <strong>{formatEGP(subtotal, locale)}</strong>
                </div>
                <div>
                  <span>{checkout.shipping}</span>
                  <strong>
                    {details.governorate
                      ? formatEGP(shippingFee, locale)
                      : checkout.shippingNotSelected}
                  </strong>
                </div>
                <div className="checkout-grand-total">
                  <span>{checkout.grandTotal}</span>
                  <strong>{formatEGP(grandTotal, locale)}</strong>
                </div>
              </div>
              {checkoutOpen && items.length > 0 ? (
                <form className="checkout-form" onSubmit={submitCheckout} noValidate>
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
                          {governorate.name[locale]} — {formatEGP(governorate.shippingFee, locale)}
                        </option>
                      ))}
                    </select>
                    {touched.governorate && errors.governorate && <small className="field-error">{checkout.governorateError}</small>}
                  </label>
                  <label>
                    <span>{checkout.address}</span>
                    <textarea
                      aria-invalid={Boolean(touched.address && errors.address)}
                      className={`checkout-input${touched.address && errors.address ? " is-invalid" : ""}`}
                      onBlur={() => touchField("address")}
                      onChange={(event) => updateField("address", event.currentTarget.value)}
                      placeholder={checkout.addressPlaceholder}
                      rows={2}
                      value={details.address}
                    />
                    {touched.address && errors.address && <small className="field-error">{checkout.addressError}</small>}
                  </label>
                  <p>{checkout.payment}: {checkout.cashOnDelivery}</p>
                  {submitError && <p className="checkout-submit-error" role="alert">{submitError}</p>}
                  <button className="button-link" disabled={submitting} type="submit">
                    {submitting ? (
                      <>
                        <span aria-hidden="true" className="checkout-spinner" />
                        {checkout.submitting}
                      </>
                    ) : checkout.submit}
                  </button>
                </form>
              ) : (
                <button
                  className="button-link"
                  disabled={items.length === 0}
                  onClick={() => setCheckoutOpen(true)}
                  type="button"
                >
                  {checkout.start}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
