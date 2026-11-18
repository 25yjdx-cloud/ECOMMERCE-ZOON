"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import type { MockLocale } from "@/mock/types";

type CartClientProps = {
  locale: MockLocale;
};

export function CartClient({ locale }: CartClientProps) {
  const { items, subtotal, setQuantity, remove } = useCart();
  const isArabic = locale === "ar";

  return (
    <main className="page-shell commerce-page" lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <div className="commerce-heading">
        <span className="eyebrow">{isArabic ? "سلة تجريبية" : "Demo cart"}</span>
        <h1 className="page-heading">{isArabic ? "سلة التسوق" : "Shopping cart"}</h1>
        <p className="mock-warning">MOCK - no order is sent</p>
      </div>
      {items.length === 0 ? (
        <section className="empty-state">
          <h2>{isArabic ? "سلتك فارغة حاليًا" : "Your cart is empty"}</h2>
          <p>{isArabic ? "أضف منتجًا من المعاينة لبدء تجربة السلة." : "Add a product from a preview to try the cart."}</p>
          <Link className="button-link" href="/gallery">{isArabic ? "استكشف القوالب" : "Browse presets"}</Link>
        </section>
      ) : (
        <div className="commerce-layout">
          <section aria-label={isArabic ? "منتجات السلة" : "Cart items"} className="cart-lines">
            {items.map(({ product, quantity }) => (
              <article className="cart-line" key={product.id}>
                <div className="cart-line-art" aria-hidden="true">{product.name[locale].slice(0, 1)}</div>
                <div className="cart-line-details">
                  <p>{product.category[locale]}</p>
                  <h2>{product.name[locale]}</h2>
                  <strong>{product.price.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {isArabic ? "ج.م" : "EGP"}</strong>
                </div>
                <label className="quantity-control">
                  <span>{isArabic ? "الكمية" : "Quantity"}</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => {
                      const nextQuantity = Number(event.currentTarget.value);
                      if (Number.isInteger(nextQuantity) && nextQuantity >= 1) {
                        setQuantity(product.id, nextQuantity);
                      }
                    }}
                  />
                </label>
                <button className="text-button" type="button" onClick={() => remove(product.id)}>
                  {isArabic ? "إزالة" : "Remove"}
                </button>
              </article>
            ))}
          </section>
          <aside className="order-summary">
            <h2>{isArabic ? "ملخص الطلب التجريبي" : "Mock order summary"}</h2>
            <p>
              <span>{isArabic ? "الإجمالي الفرعي" : "Subtotal"}</span>
              <strong>{subtotal.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {isArabic ? "ج.م" : "EGP"}</strong>
            </p>
            <Link className="button-link" href={`/checkout?lang=${locale}`}>
              {isArabic ? "متابعة إلى بيانات التوصيل" : "Continue to checkout"}
            </Link>
            <small>{isArabic ? "لا يتم إرسال أي طلب أو دفع." : "No order or payment is submitted."}</small>
          </aside>
        </div>
      )}
    </main>
  );
}
