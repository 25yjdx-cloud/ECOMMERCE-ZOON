"use client";

import { useMemo, useState, type FormEvent } from "react";

type Product = { id: string; name: string; nameEn: string; category: string; categoryEn: string; price: number; image: string; variants: string[]; variantsEn: string[] };
type StoreConfig = {
  name: string;
  nameEn: string;
  logoUrl: string;
  colors: { background: string; surface: string; text: string; accent: string };
  heroImage: string;
  heroTitle: string;
  heroTitleEn: string;
  heroSubtitle: string;
  heroSubtitleEn: string;
  whatsapp: string;
  categories: string[];
  categoriesEn: string[];
  coupon: string;
  freeShippingThreshold: number;
  shipping: { fee: number; freeThreshold: number | null; requiresApproval: boolean; noteAr: string; noteEn: string };
  showPlatformBadge: boolean;
  products: Product[];
};

export const STORE_CONFIG: StoreConfig = {
  name: "هوية",
  nameEn: "Hawia",
  logoUrl: "https://placehold.co/96x96/252525/fff?text=H",
  colors: { background: "#f4f1ed", surface: "#fff", text: "#202020", accent: "#d44827" },
  heroImage: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2000&q=85",
  heroTitle: "من الشارع. لشارعك.",
  heroTitleEn: "From the streets. For your street.",
  heroSubtitle: "ستريت وير محلي بروح جريئة، جودة يومية، وهوية من هنا.",
  heroSubtitleEn: "Local streetwear with bold energy, everyday quality, and a homegrown identity.",
  whatsapp: "201145335168",
  showPlatformBadge: true,
  categories: ["الكل", "تيشيرتات", "هوديز", "إكسسوارات"],
  categoriesEn: ["All", "Tees", "Hoodies", "Accessories"],
  coupon: "HAWIA10",
  freeShippingThreshold: 2000,
  shipping: { fee: 50, freeThreshold: 2000, requiresApproval: false, noteAr: "رسوم الشحن تُحدد حسب المحافظة.", noteEn: "Shipping fees vary by governorate." },
  products: [
    { id: "local-1", name: "تيشيرت المدينة", nameEn: "City tee", category: "تيشيرتات", categoryEn: "Tees", price: 690, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", variants: ["S · أسود", "M · أوف وايت", "L · أسود"], variantsEn: ["S · Black", "M · Off-white", "L · Black"] },
    { id: "local-2", name: "هودي المسار", nameEn: "Route hoodie", category: "هوديز", categoryEn: "Hoodies", price: 1450, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85", variants: ["M · رمادي", "L · أسود", "XL · زيتوني"], variantsEn: ["M · Grey", "L · Black", "XL · Olive"] },
    { id: "local-3", name: "كاب الحارة", nameEn: "Hara cap", category: "إكسسوارات", categoryEn: "Accessories", price: 480, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85", variants: ["أسود", "بيج"], variantsEn: ["Black", "Beige"] },
    { id: "local-4", name: "قميص خط المدينة", nameEn: "Cityline shirt", category: "تيشيرتات", categoryEn: "Tees", price: 820, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85", variants: ["S · أبيض", "M · أسود", "L · أخضر"], variantsEn: ["S · White", "M · Black", "L · Green"] },
  ],
};

type Line = { productId: string; variant: string; quantity: number };
type Locale = "ar" | "en";

export default function LocalBrandStandalone({ locale = "ar" }: { locale?: Locale }) {
  const [language, setLanguage] = useState<Locale>(locale);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(STORE_CONFIG.categories[0]);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<Line[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [policy, setPolicy] = useState("");
  const [notice, setNotice] = useState("");
  const ar = language === "ar";
  const products = useMemo(() => STORE_CONFIG.products.filter((p) =>
    (category === STORE_CONFIG.categories[0] || p.category === category)
    && `${ar ? p.name : p.nameEn} ${ar ? p.category : p.categoryEn}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [ar, category, search]);
  const subtotal = cart.reduce((total, line) => total + (STORE_CONFIG.products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0);
  const total = subtotal - (discount ? Math.round(subtotal / 10) : 0);
  const money = (value: number) => new Intl.NumberFormat(ar ? "ar-EG" : "en-US", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(value);
  function add(product: Product) {
    const variant = variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0]);
    setCart((current) => {
      const found = current.find((line) => line.productId === product.id && line.variant === variant);
      return found ? current.map((line) => line === found ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { productId: product.id, variant, quantity: 1 }];
    });
    setCartOpen(true);
  }
  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(ar ? "تم استلام طلبك التجريبي بنجاح." : "Your demo order has been received.");
    setCart([]);
    setCheckout(false);
  }

  return (
    <div className="cf-local" dir={ar ? "rtl" : "ltr"} lang={language}>
      <style>{`
        .cf-local{--bg:${STORE_CONFIG.colors.background};--surface:${STORE_CONFIG.colors.surface};--ink:${STORE_CONFIG.colors.text};--accent:${STORE_CONFIG.colors.accent};min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--font-arabic,"Cairo"),Arial,sans-serif}
        .cf-local[lang="en"]{font-family:var(--font-english,Arial),sans-serif}
        .cf-local *{box-sizing:border-box}.cf-local button,.cf-local input,.cf-local select{font:inherit}.cf-local button{cursor:pointer}
        .cf-local header{position:sticky;z-index:5;top:0;display:flex;justify-content:space-between;align-items:center;padding:1rem 5vw;background:var(--surface);border-bottom:2px solid var(--ink)}
        .cf-local .brand{display:flex;align-items:center;gap:.7rem;font-weight:1000;letter-spacing:.1em;text-transform:uppercase}.cf-local .brand img{width:42px;height:42px}
        .cf-local button,.cf-local input,.cf-local select{border:2px solid var(--ink);background:var(--surface);color:inherit;padding:.7rem 1rem}
        .cf-local .hero{min-height:450px;display:grid;align-items:center;padding:4rem 8vw;background:linear-gradient(90deg,#101010e0,#10101024),url("${STORE_CONFIG.heroImage}") center/cover;color:white}
        .cf-local .hero div{max-width:620px}.cf-local h1{font-size:clamp(2.8rem,6vw,5.5rem);line-height:.98;text-transform:uppercase;margin:.6rem 0}.cf-local .hero p{font-size:1.15rem}
        .cf-local main{padding:3rem 5vw}.cf-local .tools{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.4rem 0}.cf-local .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}
        .cf-local .card{background:var(--surface);border:1px solid #d5d0ca;animation:cf-local-rise .45s ease both}.cf-local .card img{width:100%;height:280px;object-fit:cover;filter:saturate(.8);transition:transform .38s cubic-bezier(.2,.8,.2,1)}.cf-local .card:hover img{transform:scale(1.055)}.cf-local .card:nth-child(2){animation-delay:.06s}.cf-local .card:nth-child(3){animation-delay:.12s}.cf-local .card:nth-child(4){animation-delay:.18s}.cf-local .body{padding:1rem}.cf-local .body h3{margin:.25rem 0}.cf-local .body select{width:100%;margin:.7rem 0}
        .cf-local .buy{width:100%;border:2px solid var(--ink);background:var(--accent);color:white;font-weight:900;text-transform:uppercase}.cf-local .drawer,.cf-local .modal{position:fixed;inset:0;z-index:9;background:#101010bd;display:flex;justify-content:flex-end}
        .cf-local .panel{width:min(440px,100%);height:100%;overflow:auto;background:var(--surface);padding:1.4rem}.cf-local .modal{align-items:center;justify-content:center;padding:1rem}.cf-local .modal .panel{height:auto;max-height:90vh}
        .cf-local .line{display:flex;justify-content:space-between;border-bottom:1px solid #ccc;padding:.75rem 0}.cf-local footer{padding:2rem 5vw;background:#202020;color:white;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}.cf-local footer button{background:none;color:inherit;border:0;text-decoration:underline}
        .cf-local .panel{animation:cf-local-panel .28s cubic-bezier(.2,.8,.2,1) both}.cf-local .tools>*{transition:border-color .2s,box-shadow .2s}.cf-local .tools>*:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);outline:0}.cf-local .cf-brand-badge{display:flex;align-items:center;gap:.45rem;font-size:.8rem;font-weight:800}.cf-local .cf-brand-badge svg{width:28px;height:28px}.cf-local .cf-brand-badge strong{color:#ff9a6f}.cf-local .cf-brand-tagline{display:block;font-size:.62rem;font-weight:500;opacity:.72}@keyframes cf-local-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes cf-local-panel{from{opacity:.7;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@media(max-width:850px){.cf-local .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.cf-local .grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.cf-local *,.cf-local *::before,.cf-local *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>
      <style>{`
        .cf-local .drawer{justify-content:flex-start}
        .cf-local .drawer .panel{display:flex;flex-direction:column;overflow-y:auto;height:100dvh;padding-bottom:1rem}
        .cf-local .drawer .panel>.buy:last-child{position:sticky;bottom:-1rem;z-index:2;margin-top:auto}
      `}</style>
      <header><div className="brand"><img alt="" src={STORE_CONFIG.logoUrl} />{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn}</div><div><button onClick={() => { setVariants({}); setLanguage(ar ? "en" : "ar"); }} type="button">{ar ? "EN" : "عربي"}</button>{" "}<button onClick={() => setCartOpen(true)} type="button">{ar ? "السلة" : "Cart"} ({cart.reduce((n, line) => n + line.quantity, 0)})</button></div></header>
      <section className="hero"><div><span>{ar ? "صنع محلياً" : "Locally made"}</span><h1>{ar ? STORE_CONFIG.heroTitle : STORE_CONFIG.heroTitleEn}</h1><p>{ar ? STORE_CONFIG.heroSubtitle : STORE_CONFIG.heroSubtitleEn}</p><a className="buy" href="#hawia-products">{ar ? "شوف المجموعة" : "Shop the drop"}</a></div></section>
      <main id="hawia-products"><h2>{ar ? "إصدارات هوية" : "HAWIA releases"}</h2><div className="tools"><input onChange={(e) => setSearch(e.target.value)} placeholder={ar ? "ابحث عن منتج" : "Search products"} value={search} /><select onChange={(e) => setCategory(e.target.value)} value={category}>{STORE_CONFIG.categories.map((item, index) => <option key={item} value={item}>{ar ? item : STORE_CONFIG.categoriesEn[index]}</option>)}</select></div>
        <div className="grid">{products.map((product) => <article className="card" key={product.id}><img alt={ar ? product.name : product.nameEn} loading="lazy" src={product.image} /><div className="body"><small>{ar ? product.category : product.categoryEn}</small><h3>{ar ? product.name : product.nameEn}</h3><strong>{money(product.price)}</strong><select aria-label={ar ? "المقاس واللون" : "Size and color"} onChange={(e) => setVariants((v) => ({ ...v, [product.id]: e.target.value }))} value={variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0])}>{(ar ? product.variants : product.variantsEn).map((item) => <option key={item}>{item}</option>)}</select><button className="buy" onClick={() => add(product)} type="button">{ar ? "أضف للسلة" : "Add to cart"}</button></div></article>)}</div>
      </main>
      <footer><span>{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn} · {ar ? "جذور محلية، أسلوب بلا حدود" : "Local roots, no limits"}</span>{STORE_CONFIG.showPlatformBadge && <span className="cf-brand-badge"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 29V14a12 12 0 0 1 24 0v15h-6V14a6 6 0 0 0-12 0v15H4Z" fill="currentColor"/><path d="M7 17h7l2-4h5l3 5 4 2-3 4h-7l-2 5-3-5H9l-2-7Z" fill="#D9541E"/></svg><span><strong>CommerceForge</strong><small className="cf-brand-tagline">{ar ? "من الفكرة إلى متجرك" : "From idea to store"}</small></span></span>}<div>{["الاستبدال والاسترجاع", "الشحن", "الخصوصية"].map((item) => <button key={item} onClick={() => setPolicy(item)} type="button">{ar ? item : item === "الشحن" ? "Shipping" : item === "الخصوصية" ? "Privacy" : "Returns"}</button>)}</div><a href={`https://wa.me/${STORE_CONFIG.whatsapp}`} rel="noreferrer" target="_blank">{ar ? "واتساب" : "WhatsApp"}</a></footer>
      {notice && <div className="modal" role="status"><section className="panel"><p>{notice}</p><button onClick={() => setNotice("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
      {cartOpen && <div className="drawer" onClick={() => setCartOpen(false)} role="presentation"><aside className="panel" onClick={(e) => e.stopPropagation()}><button onClick={() => setCartOpen(false)} type="button">×</button><h2>{ar ? "السلة" : "Cart"}</h2>{cart.map((line) => { const product = STORE_CONFIG.products.find((p) => p.id === line.productId)!; return <div className="line" key={`${line.productId}-${line.variant}`}><span>{ar ? product.name : product.nameEn} · {line.variant} × {line.quantity}</span><b>{money(product.price * line.quantity)}</b></div>; })}      <p>{ar ? "الإجمالي" : "Subtotal"}: {money(total)}</p><progress aria-label={ar ? "التقدم نحو الشحن المجاني" : "Free shipping progress"} max={100} value={Math.min(100, subtotal / STORE_CONFIG.freeShippingThreshold * 100)} /><p>{subtotal >= STORE_CONFIG.freeShippingThreshold ? (ar ? "أصبح الشحن مجانياً" : "Free shipping unlocked") : ar ? `أضف ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} للشحن المجاني` : `Add ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} for free shipping`}</p><div className="tools"><input onChange={(e) => setCoupon(e.target.value)} placeholder={ar ? "كود الخصم" : "Coupon"} value={coupon} /><button onClick={() => setDiscount(coupon.trim().toUpperCase() === STORE_CONFIG.coupon)} type="button">{ar ? "تطبيق" : "Apply"}</button></div>{discount && <p>{ar ? "خصم 10% مفعّل" : "10% discount applied"}</p>}<button className="buy" disabled={!cart.length} onClick={() => setCheckout(true)} type="button">{ar ? "إتمام الطلب" : "Checkout"}</button></aside></div>}
      {checkout && <div className="modal"><form className="panel" onSubmit={placeOrder}><h2>{ar ? "بيانات التوصيل" : "Delivery details"}</h2><input required minLength={2} placeholder={ar ? "الاسم" : "Name"} /><input required pattern="01[0125][0-9]{8}" placeholder={ar ? "رقم الهاتف" : "Phone"} /><input required minLength={5} placeholder={ar ? "العنوان" : "Address"} /><div className="tools"><button className="buy" type="submit">{ar ? "تأكيد الطلب التجريبي" : "Confirm demo order"}</button><button onClick={() => setCheckout(false)} type="button">{ar ? "إلغاء" : "Cancel"}</button></div></form></div>}
      {policy && <div className="modal"><section className="panel"><h2>{policy}</h2><p>{ar ? `راجع تفاصيل ${policy} لدى ${STORE_CONFIG.name} قبل الشراء، أو تواصل معنا عبر واتساب.` : `Review ${policy.toLowerCase()} details before shopping with ${STORE_CONFIG.name}, or contact us on WhatsApp.`}</p><button onClick={() => setPolicy("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
    </div>
  );
}
