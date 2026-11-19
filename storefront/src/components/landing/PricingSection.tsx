"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatEGP } from "@/i18n/format";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";

type PricingSectionProps = {
  content: Dictionary["pricing"];
  locale: MockLocale;
  user: AuthUser | null;
};

export function PricingSection({ content, locale, user }: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="content-section page-shell pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="section-intro">
        <span className="eyebrow">{content.eyebrow}</span>
        <h2 id="pricing-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <div className="pricing-controls">
        <div className="pricing-toggle" role="group" aria-label={content.billingPeriod}>
          <button aria-pressed={!yearly} onClick={() => setYearly(false)} type="button">{content.monthly}</button>
          <button aria-pressed={yearly} onClick={() => setYearly(true)} type="button">{content.yearly}</button>
        </div>
        <span className="pricing-savings">{content.savings}</span>
      </div>
      <div className="pricing-grid">
        {content.plans.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const isPopular = plan.slug === "advanced";
          const href = user?.role === "merchant"
            ? `/dashboard/my-store?lang=${locale}&plan=${encodeURIComponent(plan.slug)}`
            : user?.role === "super_admin"
              ? `/manager/classic?lang=${locale}`
              : `/login?lang=${locale}&plan=${encodeURIComponent(plan.slug)}`;

          return (
            <article className={`pricing-card${isPopular ? " pricing-card-popular" : ""}`} key={plan.slug}>
              {isPopular && <span className="pricing-popular-badge">{content.popular}</span>}
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="pricing-amount">
                <strong>{price === 0 ? content.free : formatEGP(price, locale)}</strong>
                <span>{price === 0 ? content.forever : yearly ? content.yearlyRate : content.monthlyRate}</span>
              </div>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <Link
                className={`button-link${isPopular ? "" : " secondary"}`}
                href={href}
              >
                {plan.cta}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
