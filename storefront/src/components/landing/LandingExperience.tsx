import Link from "next/link";
import {
  Activity,
  Check,
  CircleDollarSign,
  Globe2,
  Languages,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale } from "@/mock/types";
import {
  AnimatedPathDraw,
  FadeUpInView,
  FadeUpSection,
  FloatingChatPulse,
  FloatingIsometricCard,
  FloatingOrbitPill,
  HoverLiftCard,
  StaggerGrid,
  StaggerItem,
  SpringLink,
} from "@/components/motion/MotionPrimitives";
import { LandingHeader } from "./LandingHeader";
import { PricingSection } from "./PricingSection";
import { PresetCardGrid } from "@/components/storefront/PresetCardGrid";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import type { AuthUser } from "@/lib/auth";
import { QuoteRequestForm } from "./QuoteRequestForm";
import { Footer } from "./Footer";

type LandingExperienceProps = {
  locale: MockLocale;
  dictionary: Dictionary;
  presets: readonly Preset[];
  user: AuthUser | null;
};

const valueIcons = [
  <path d="M4 5h16v13H4zM8 22h8m-4-4v4m9-14h3v13h-4" key="rtl" />,
  <path d="M5 18 18 5m-8 0h8v8M4 22h16" key="delivery" />,
  <path d="M12 3 4 7v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V7l-8-4Zm-3 9 2 2 4-4" key="ownership" />,
];

export function LandingExperience({ locale, dictionary, presets, user }: LandingExperienceProps) {
  const isArabic = locale === "ar";
  const content = dictionary.landing;
  const demoProducts = mockData.fashion.products.slice(0, 3);
  const currency = new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  });
  const valueProps = [
    { title: content.rtlTitle, text: content.rtlText, icon: valueIcons[0] },
    { title: content.deliveryTitle, text: content.deliveryText, icon: valueIcons[1] },
    { title: content.ownershipTitle, text: content.ownershipText, icon: valueIcons[2] },
  ];
  const steps = [
    { title: content.step1Title, text: content.step1Text, art: "01" },
    { title: content.step2Title, text: content.step2Text, art: "02" },
    { title: content.step3Title, text: content.step3Text, art: "03" },
    { title: content.step4Title, text: content.step4Text, art: "04" },
  ];
  const faqs = [
    [content.faqDeliveryQ, content.faqDeliveryA],
    [content.faqOwnershipQ, content.faqOwnershipA],
    [content.faqArabicQ, content.faqArabicA],
    [content.faqDomainQ, content.faqDomainA],
    [content.faqPaymentsQ, content.faqPaymentsA],
  ];

  return (
    <>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader locale={locale} dictionary={dictionary} user={user} />
      <main lang={locale} dir={isArabic ? "rtl" : "ltr"}>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <FadeUpInView className="hero-copy">
              <span className="eyebrow">{content.heroEyebrow}</span>
              <h1>
                {content.heroTitle}{" "}
                <span className="hero-title-highlight">{content.heroTitleHighlight}</span>
              </h1>
              <p>{content.heroDescription}</p>
              <div className="button-row">
                <SpringLink className="button-link" href={`/gallery?lang=${locale}`}>{content.explorePresets}</SpringLink>
                <SpringLink className="button-link secondary" href={`/preview/fashion?lang=${locale}`}>{dictionary.navigation.livePreview}</SpringLink>
              </div>
            </FadeUpInView>
            <div className="hero-visual">
              <FloatingIsometricCard className="hero-float-card">
                <div className="browser-frame" aria-label={dictionary.navigation.livePreview}>
                  <div className="browser-toolbar" aria-hidden="true">
                    <span className="browser-dot" />
                    <span className="browser-dot" />
                    <span className="browser-dot" />
                    <span className="browser-address">commerceforge.demo</span>
                  </div>
                  <div className="browser-store">
                    <div className="browser-store-head">
                      <span>{dictionary.store.storeNames.fashion}</span>
                      <span className="browser-cart-count">{dictionary.store.cart} · 2</span>
                    </div>
                    <div className="browser-store-hero">
                      <strong>{isArabic ? "تفاصيل تصنع أسلوبك" : "Details shape your style"}</strong>
                      <span>{isArabic ? "مجموعة يومية بلمسة خاصة" : "Everyday pieces with a personal touch"}</span>
                    </div>
                    <div className="browser-product-grid">
                      {demoProducts.map((product) => (
                        <div className="browser-product" key={product.id}>
                          <span className="browser-product-art">{dictionary.store.placeholder}</span>
                          <strong>{product.name[locale]}</strong>
                          <small>{currency.format(product.price)}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FloatingIsometricCard>
              <div className="hero-orbit" aria-hidden="true">
                {content.heroBadges.map((badge, index) => (
                  <FloatingOrbitPill
                    className={`orbit-pill orbit-pill-${index + 1}`}
                    delay={index * 0.18}
                    key={badge}
                  >
                    {badge}
                  </FloatingOrbitPill>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="trust-strip">
          <span>{content.trustPrefix}</span>
          <strong>{content.trustText}</strong>
        </div>

        <FadeUpSection className="content-section page-shell" aria-labelledby="value-title">
          <div className="section-intro">
            <span className="eyebrow">{content.valueEyebrow}</span>
            <h2 id="value-title">{content.valueTitle}</h2>
            <p>{content.valueDescription}</p>
          </div>
          <StaggerGrid className="value-grid">
            {valueProps.map((item) => (
              <StaggerItem key={item.title}>
                <article className="value-card">
                  <span className="value-icon">
                    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="24">
                      {item.icon}
                    </svg>
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </FadeUpSection>

        <FadeUpSection className="content-section page-shell" id="how-it-works" aria-labelledby="steps-title">
          <div className="section-intro">
            <span className="eyebrow">{content.stepsEyebrow}</span>
            <h2 id="steps-title">{content.stepsTitle}</h2>
          </div>
          <StaggerGrid className="steps-grid">
            {steps.map((step) => (
              <StaggerItem key={step.art}>
                <article className="step-card">
                  <span className="step-number">{step.art}</span>
                  <div aria-hidden="true" className="step-illustration">{step.art}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </FadeUpSection>

        <FadeUpSection className="content-section page-shell bento-section" id="features" aria-labelledby="bento-title">
          <div className="section-intro">
            <span className="eyebrow">{content.featuresEyebrow}</span>
            <h2 id="bento-title">{content.bentoTitle}</h2>
          </div>
          <StaggerGrid className="bento-grid">
            {content.bentoItems.map((item, index) => (
              <StaggerItem className={`bento-item bento-item-${index + 1}`} key={item.title}>
                <HoverLiftCard className="bento-card">
                  <BentoArtwork index={index} dictionary={dictionary} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </HoverLiftCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </FadeUpSection>

        <FadeUpSection className="content-section page-shell" aria-labelledby="features-title">
          <div className="section-intro">
            <span className="eyebrow">{content.featuresEyebrow}</span>
            <h2 id="features-title">{content.featuresTitle}</h2>
          </div>
          <div className="feature-row">
            <div className="feature-copy">
              <h3>{content.ordersTitle}</h3>
              <p>{content.ordersText}</p>
            </div>
            <div className="feature-mockup" aria-label={content.ordersTitle}>
              <div className="mockup-titlebar"><span>{dictionary.dashboard.orders}</span><span>{dictionary.dashboard.status}</span></div>
              {["#IOY329", "#IOY328", "#IOY327"].map((order, index) => (
                <div className="mock-row" key={order}>
                  <strong>{order}</strong>
                  <span className="status-pill">{index === 0 ? dictionary.dashboard.processing : dictionary.dashboard.awaiting}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-copy">
              <h3>{content.variantsTitle}</h3>
              <p>{content.variantsText}</p>
            </div>
            <div className="feature-mockup" aria-label={content.variantsTitle}>
              <div className="mockup-titlebar"><span>{dictionary.dashboard.products}</span><span>{dictionary.dashboard.quantity}</span></div>
              {["S", "M", "L"].map((size) => (
                <div className="variant-row" key={size}>
                  <span>{content.sizeLabel} {size}</span>
                  <span className="stock-track"><span /></span>
                  <strong>12</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-copy">
              <h3>{content.analyticsTitle}</h3>
              <p>{content.analyticsText}</p>
            </div>
            <div className="feature-mockup" aria-label={content.analyticsTitle}>
              <div className="mockup-titlebar"><span>{content.analyticsTitle}</span><span>{dictionary.dashboard.demoData}</span></div>
              <div aria-hidden="true" className="mini-chart">
                {[38, 62, 46, 78, 55, 88, 68].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </FadeUpSection>

        <FadeUpSection className="content-section page-shell" id="presets" aria-labelledby="presets-title">
          <div className="section-intro">
            <span className="eyebrow">{content.presetsTitle}</span>
            <h2 id="presets-title">{content.presetsText}</h2>
          </div>
          <PresetCardGrid presets={presets} locale={locale} dictionary={dictionary} user={user} />
        </FadeUpSection>

        <FadeUpSection className="content-section page-shell" aria-labelledby="assistant-title">
          <div className="assistant-section">
            <div className="section-intro">
              <span className="eyebrow">{content.assistantEyebrow}</span>
              <h2 id="assistant-title">{content.assistantTitle}</h2>
              <p>{content.assistantText}</p>
              <span className="concept-label">{content.conceptPreview}</span>
            </div>
            <FloatingChatPulse className="assistant-chat">
              <div className="chat-bubble">{content.assistantQuestion}</div>
              <div className="chat-bubble answer">{content.assistantAnswer}</div>
            </FloatingChatPulse>
          </div>
        </FadeUpSection>

        <PricingSection content={dictionary.pricing} locale={locale} user={user} />

        <FadeUpSection className="content-section page-shell" id="contact" aria-labelledby="quote-title">
          <div className="contact-card">
            <div className="section-intro">
              <h2 id="quote-title">{content.quoteTitle}</h2>
              <p>{content.quoteText}</p>
            </div>
            <QuoteRequestForm content={dictionary.quote} locale={locale} />
          </div>
        </FadeUpSection>

        <FadeUpSection className="content-section page-shell" aria-labelledby="faq-title">
          <div className="section-intro">
            <span className="eyebrow">{content.faqEyebrow}</span>
            <h2 id="faq-title">{content.faqTitle}</h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details className="faq-item" key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </FadeUpSection>

        <FadeUpSection className="final-cta">
          <div className="page-shell final-cta-inner">
            <h2>{content.finalTitle}</h2>
            <Link className="button-link" href={`/gallery?lang=${locale}`}>{content.finalCta}</Link>
          </div>
        </FadeUpSection>
      </main>
      <Footer locale={locale} />
    </>
  );
}

function BentoArtwork({ index, dictionary }: { index: number; dictionary: Dictionary }) {
  const content = dictionary.landing;

  if (index === 0) {
    return (
      <div aria-hidden="true" className="bento-art bento-store-window">
        <div className="bento-window-bar"><i /><i /><i /></div>
        <div className="bento-store-preview">
          <ShoppingBag size={24} strokeWidth={1.6} />
          <span>{dictionary.store.storeNames.fashion}</span>
        </div>
        <div className="bento-store-tiles"><i /><i /><i /></div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div aria-hidden="true" className="bento-art bento-orders">
        {content.bentoOrderLines.map((order) => <span key={order}>{order}</span>)}
      </div>
    );
  }

  if (index === 2) {
    return (
      <div aria-hidden="true" className="bento-art bento-money">
        <CircleDollarSign size={34} strokeWidth={1.5} />
        <strong>+1,250 {dictionary.store.currency}</strong>
        <span><Check size={14} /> {content.ownershipTitle}</span>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div aria-hidden="true" className="bento-art bento-route">
        <span className="route-point route-origin"><Package size={18} /></span>
        <svg viewBox="0 0 240 80">
          <AnimatedPathDraw
            d="M8 62 C 58 8, 118 72, 174 26 S 222 20, 232 12"
            fill="none"
            stroke="currentColor"
            strokeDasharray="5 7"
            strokeWidth="3"
          />
        </svg>
        <span className="route-point route-destination"><Truck size={18} /></span>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div aria-hidden="true" className="bento-art bento-assistant">
        <span className="assistant-orb"><Sparkles size={30} /></span>
        <span className="assistant-chip">AI</span>
        <span className="assistant-chip">T</span>
      </div>
    );
  }

  if (index === 5) {
    return (
      <div aria-hidden="true" className="bento-art bento-languages">
        <span className="bento-language-active"><Languages size={18} /> RTL</span>
        <span>LTR</span>
        <strong>ع</strong>
      </div>
    );
  }

  if (index === 6) {
    return (
      <div aria-label={`${content.bentoDomain} — ${content.domainBadge}`} className="bento-art bento-domain">
        <Globe2 size={20} />
        <span dir="ltr">{content.bentoDomain}</span>
        <strong>{content.domainBadge}</strong>
        <i />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="bento-art bento-stock">
      <Activity size={32} strokeWidth={1.5} />
      <span className="stock-meter"><i /></span>
      <strong>{content.bentoStock}</strong>
    </div>
  );
}
