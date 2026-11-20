"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { formatMarketPrice, MARKET_CONFIG, SAAS_PRICES, SAAS_YEARLY_MONTHLY_PRICES } from "@/config/pricing.config";
import { MarketSwitcher, useMarket } from "./MarketSwitcher";

type PricingSectionProps = {
  content: Dictionary["pricing"];
  locale: MockLocale;
  user: AuthUser | null;
};

export function PricingSection({ content, locale, user }: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);
  const [market] = useMarket();

  return (
    <section className="content-section page-shell pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="section-intro">
        <span className="eyebrow">{content.eyebrow}</span>
        <h2 id="pricing-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <MarketSwitcher locale={locale} />
      <div className="pricing-controls">
        <div className="pricing-toggle" role="group" aria-label={content.billingPeriod}>
          <button aria-pressed={!yearly} onClick={() => setYearly(false)} type="button">{content.monthly}</button>
          <button aria-pressed={yearly} onClick={() => setYearly(true)} type="button">{content.yearly}</button>
        </div>
        <span className="pricing-savings">{content.savings}</span>
      </div>
      <div className="pricing-grid">
        {content.plans.map((plan) => {
          const marketPrices = Object.entries(SAAS_PRICES).find(([slug]) => slug === plan.slug)?.[1];
          const monthlyPrice = marketPrices?.[market] ?? plan.monthly;
          const yearlyPrices = Object.entries(SAAS_YEARLY_MONTHLY_PRICES).find(([slug]) => slug === plan.slug)?.[1];
          const yearlyPrice = yearlyPrices?.[market] ?? plan.yearly;
          const price = yearly ? yearlyPrice : monthlyPrice;
          const isPopular = plan.slug === "advanced";
          const href = user?.role === "merchant"
            ? `/dashboard/my-store?lang=${locale}&plan=${encodeURIComponent(plan.slug)}`
            : user?.role === "super_admin"
              ? `/manager/classic?lang=${locale}`
              : `/login?lang=${locale}&plan=${encodeURIComponent(plan.slug)}`;

          return (
            <article className={`pricing-card${isPopular ? " pricing-card-popular" : ""}`} key={plan.slug}>
              {isPopular && <span className="pricing-popular-badge"><BrandLogo size={20} variant="mark" />{content.popular}</span>}
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="pricing-amount">
                <strong>{formatMarketPrice(price, market, locale)}</strong>
                <span>{price === 0
                  ? locale === "ar" ? "لمدة 14 يوماً" : "for 14 days"
                  : yearly ? content.yearlyRate : content.monthlyRate}</span>
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
      <p className="market-payment-copy">{MARKET_CONFIG[market].paymentShipping[locale]}</p>
    </section>
  );
}
