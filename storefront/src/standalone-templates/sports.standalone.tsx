"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";

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
  name: "نَبض",
  nameEn: "Nabd",
  logoUrl: "https://placehold.co/96x96/15291f/fff?text=N",
  colors: { background: "#f0f3ed", surface: "#fff", text: "#17251d", accent: "#147a50" },
  heroImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=85",
  heroTitle: "تحرك بثقة. العب بطريقتك.",
  heroTitleEn: "Move with confidence. Play your way.",
  heroSubtitle: "ملابس وأدوات رياضية تساعدك تكمّل كل تمرين بأداء أفضل.",
  heroSubtitleEn: "Sportswear and gear to help you bring more to every workout.",
  whatsapp: "201145335168",
  showPlatformBadge: true,
  categories: ["الكل", "ملابس", "معدات", "إكسسوارات"],
  categoriesEn: ["All", "Apparel", "Gear", "Accessories"],
  coupon: "NABD10",
  freeShippingThreshold: 2200,
  shipping: { fee: 50, freeThreshold: 2200, requiresApproval: false, noteAr: "رسوم الشحن تُحدد حسب المحافظة.", noteEn: "Shipping fees vary by governorate." },
  products: [
    { id: "nabd-1", name: "تيشيرت الحركة", nameEn: "Motion training tee", category: "ملابس", categoryEn: "Apparel", price: 790, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", variants: ["S · أسود", "M · أسود", "L · أخضر"], variantsEn: ["S · Black", "M · Black", "L · Green"] },
    { id: "nabd-2", name: "حذاء الجري السريع", nameEn: "Stride running shoe", category: "معدات", categoryEn: "Gear", price: 2450, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", variants: ["40 · أحمر", "42 · أسود", "44 · أبيض"], variantsEn: ["40 · Red", "42 · Black", "44 · White"] },
    { id: "nabd-3", name: "حقيبة التدريب", nameEn: "Training duffel", category: "إكسسوارات", categoryEn: "Accessories", price: 1180, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", variants: ["30 لتر · رمادي", "45 لتر · أسود"], variantsEn: ["30 L · Grey", "45 L · Black"] },
    { id: "nabd-4", name: "جاكيت الأداء", nameEn: "Performance jacket", category: "ملابس", categoryEn: "Apparel", price: 1690, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85", variants: ["M · أسود", "L · أزرق"], variantsEn: ["M · Black", "L · Blue"] },
  ],
};

type Line = { productId: string; variant: string; quantity: number };
type Locale = "ar" | "en";

export default function SportsStandalone({ locale = "ar" }: { locale?: Locale }) {
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
    <div className="cf-nabd" dir={ar ? "rtl" : "ltr"} lang={language}>
      <style>{`
        .cf-nabd{--bg:${STORE_CONFIG.colors.background};--surface:${STORE_CONFIG.colors.surface};--ink:${STORE_CONFIG.colors.text};--accent:${STORE_CONFIG.colors.accent};min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--font-arabic,"Cairo"),Arial,sans-serif}
        .cf-nabd[lang="en"]{font-family:var(--font-english,Arial),sans-serif}
        .cf-nabd *{box-sizing:border-box}.cf-nabd button,.cf-nabd input,.cf-nabd select{font:inherit}.cf-nabd button{cursor:pointer}
        .cf-nabd header{position:sticky;z-index:5;top:0;display:flex;justify-content:space-between;align-items:center;padding:1rem 5vw;background:var(--surface)}
        .cf-nabd .brand{display:flex;align-items:center;gap:.7rem;font-weight:900;font-size:1.2rem}.cf-nabd .brand img{width:42px;height:42px;border-radius:50%}
        .cf-nabd button,.cf-nabd select,.cf-nabd input{border:1px solid #ccd7ce;border-radius:.7rem;padding:.7rem;background:var(--surface);color:inherit}
        .cf-nabd .hero{min-height:420px;display:grid;align-items:center;padding:4rem 8vw;color:white;background:linear-gradient(90deg,#0d241dd9,#0d241d22),url("${STORE_CONFIG.heroImage}") center/cover}
        .cf-nabd .hero div{max-width:570px}.cf-nabd h1{font-size:clamp(2.5rem,5vw,4.7rem);line-height:1.08;margin:.6rem 0}.cf-nabd .hero p{font-size:1.15rem}
        .cf-nabd main{padding:3rem 5vw}.cf-nabd .tools{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.4rem 0}.cf-nabd .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}
        .cf-nabd .card{background:var(--surface);border-radius:1rem;overflow:hidden;box-shadow:0 12px 30px #17251d12;animation:cf-nabd-rise .45s ease both}.cf-nabd .card img{width:100%;height:230px;object-fit:cover;transition:transform .38s cubic-bezier(.2,.8,.2,1)}.cf-nabd .card:hover img{transform:scale(1.055)}.cf-nabd .card:nth-child(2){animation-delay:.06s}.cf-nabd .card:nth-child(3){animation-delay:.12s}.cf-nabd .card:nth-child(4){animation-delay:.18s}.cf-nabd .body{padding:1rem}.cf-nabd .body h3{margin:.25rem 0}.cf-nabd .body select{width:100%;margin:.65rem 0}
        .cf-nabd .buy{width:100%;border:0;background:var(--accent);color:white;font-weight:800}.cf-nabd .drawer,.cf-nabd .modal{position:fixed;inset:0;z-index:9;background:#07140dbb;display:flex;justify-content:flex-end}
        .cf-nabd .panel{width:min(430px,100%);height:100%;overflow:auto;background:var(--surface);padding:1.4rem}.cf-nabd .modal{align-items:center;justify-content:center;padding:1rem}.cf-nabd .modal .panel{height:auto;max-height:90vh;border-radius:1rem}
        .cf-nabd .line{display:flex;justify-content:space-between;border-bottom:1px solid #d5dfd7;padding:.7rem 0}.cf-nabd footer{padding:2rem 5vw;background:#14291f;color:white;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}.cf-nabd footer button{background:none;color:inherit;border:0;text-decoration:underline}
        .cf-nabd .panel{animation:cf-nabd-panel .28s cubic-bezier(.2,.8,.2,1) both}.cf-nabd .tools>*{transition:border-color .2s,box-shadow .2s}.cf-nabd .tools>*:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);outline:0}.cf-nabd .cf-brand-badge{display:flex;align-items:center;gap:.45rem;font-size:.8rem;font-weight:800}.cf-nabd .cf-brand-badge svg{width:28px;height:28px}.cf-nabd .cf-brand-badge strong{color:#ff9a6f}.cf-nabd .cf-brand-tagline{display:block;font-size:.62rem;font-weight:500;opacity:.72}@keyframes cf-nabd-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes cf-nabd-panel{from{opacity:.7;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@media(max-width:850px){.cf-nabd .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.cf-nabd .grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.cf-nabd *,.cf-nabd *::before,.cf-nabd *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>
      <style>{`
        .cf-nabd .drawer{justify-content:flex-start}
        .cf-nabd .drawer .panel{display:flex;flex-direction:column;overflow-y:auto;height:100dvh;padding-bottom:1rem}
        .cf-nabd .drawer .panel>.buy:last-child{position:sticky;bottom:-1rem;z-index:2;margin-top:auto}
      `}</style>
      <header><div className="brand"><Image alt="" height={48} src={STORE_CONFIG.logoUrl} unoptimized width={48} />{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn}</div><div><button onClick={() => { setVariants({}); setLanguage(ar ? "en" : "ar"); }} type="button">{ar ? "EN" : "عربي"}</button>{" "}<button onClick={() => setCartOpen(true)} type="button">{ar ? "السلة" : "Cart"} ({cart.reduce((n, line) => n + line.quantity, 0)})</button></div></header>
      <section className="hero"><div><span>{ar ? "ابدأ من هنا" : "Start here"}</span><h1>{ar ? STORE_CONFIG.heroTitle : STORE_CONFIG.heroTitleEn}</h1><p>{ar ? STORE_CONFIG.heroSubtitle : STORE_CONFIG.heroSubtitleEn}</p><a className="buy" href="#nabd-products">{ar ? "اكتشف المنتجات" : "Explore products"}</a></div></section>
      <main id="nabd-products"><h2>{ar ? "اختيارات التدريب" : "Training essentials"}</h2><div className="tools"><input onChange={(e) => setSearch(e.target.value)} placeholder={ar ? "ابحث عن منتج" : "Search products"} value={search} /><select onChange={(e) => setCategory(e.target.value)} value={category}>{STORE_CONFIG.categories.map((item, index) => <option key={item} value={item}>{ar ? item : STORE_CONFIG.categoriesEn[index]}</option>)}</select></div>
        <div className="grid">{products.map((product) => <article className="card" key={product.id}><Image alt={ar ? product.name : product.nameEn} height={300} loading="lazy" src={product.image} unoptimized width={400} /><div className="body"><small>{ar ? product.category : product.categoryEn}</small><h3>{ar ? product.name : product.nameEn}</h3><strong>{money(product.price)}</strong><select aria-label={ar ? "المقاس واللون" : "Size and color"} onChange={(e) => setVariants((v) => ({ ...v, [product.id]: e.target.value }))} value={variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0])}>{(ar ? product.variants : product.variantsEn).map((item) => <option key={item}>{item}</option>)}</select><button className="buy" onClick={() => add(product)} type="button">{ar ? "أضف للسلة" : "Add to cart"}</button></div></article>)}</div>
      </main>
      <footer><span>{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn} · {ar ? "أداء يبدأ باختيارك" : "Performance starts with your choice"}</span>{STORE_CONFIG.showPlatformBadge && <span className="cf-brand-badge"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 29V14a12 12 0 0 1 24 0v15h-6V14a6 6 0 0 0-12 0v15H4Z" fill="currentColor"/><path d="M7 17h7l2-4h5l3 5 4 2-3 4h-7l-2 5-3-5H9l-2-7Z" fill="#D9541E"/></svg><span><strong>CommerceForge</strong><small className="cf-brand-tagline">{ar ? "من الفكرة إلى متجرك" : "From idea to store"}</small></span></span>}<div>{["الاستبدال والاسترجاع", "الشحن", "الخصوصية"].map((item) => <button key={item} onClick={() => setPolicy(item)} type="button">{ar ? item : item === "الشحن" ? "Shipping" : item === "الخصوصية" ? "Privacy" : "Returns"}</button>)}</div><a href={`https://wa.me/${STORE_CONFIG.whatsapp}`} rel="noreferrer" target="_blank">{ar ? "واتساب" : "WhatsApp"}</a></footer>
      {notice && <div className="modal" role="status"><section className="panel"><p>{notice}</p><button onClick={() => setNotice("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
      {cartOpen && <div className="drawer" onClick={() => setCartOpen(false)} role="presentation"><aside className="panel" onClick={(e) => e.stopPropagation()}><button onClick={() => setCartOpen(false)} type="button">×</button><h2>{ar ? "السلة" : "Cart"}</h2>{cart.map((line) => { const product = STORE_CONFIG.products.find((p) => p.id === line.productId)!; return <div className="line" key={`${line.productId}-${line.variant}`}><span>{ar ? product.name : product.nameEn} · {line.variant} × {line.quantity}</span><b>{money(product.price * line.quantity)}</b></div>; })}      <p>{ar ? "الإجمالي" : "Subtotal"}: {money(total)}</p><progress aria-label={ar ? "التقدم نحو الشحن المجاني" : "Free shipping progress"} max={100} value={Math.min(100, subtotal / STORE_CONFIG.freeShippingThreshold * 100)} /><p>{subtotal >= STORE_CONFIG.freeShippingThreshold ? (ar ? "أصبح الشحن مجانياً" : "Free shipping unlocked") : ar ? `أضف ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} للشحن المجاني` : `Add ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} for free shipping`}</p><div className="tools"><input onChange={(e) => setCoupon(e.target.value)} placeholder={ar ? "كود الخصم" : "Coupon"} value={coupon} /><button onClick={() => setDiscount(coupon.trim().toUpperCase() === STORE_CONFIG.coupon)} type="button">{ar ? "تطبيق" : "Apply"}</button></div>{discount && <p>{ar ? "خصم 10% مفعّل" : "10% discount applied"}</p>}<button className="buy" disabled={!cart.length} onClick={() => setCheckout(true)} type="button">{ar ? "إتمام الطلب" : "Checkout"}</button></aside></div>}
      {checkout && <div className="modal"><form className="panel" onSubmit={placeOrder}><h2>{ar ? "بيانات الطلب" : "Order details"}</h2><input required minLength={2} placeholder={ar ? "الاسم" : "Name"} /><input required pattern="01[0125][0-9]{8}" placeholder={ar ? "رقم الهاتف" : "Phone"} /><input required minLength={5} placeholder={ar ? "العنوان" : "Address"} /><div className="tools"><button className="buy" type="submit">{ar ? "تأكيد الطلب التجريبي" : "Confirm demo order"}</button><button onClick={() => setCheckout(false)} type="button">{ar ? "رجوع" : "Cancel"}</button></div></form></div>}
      {policy && <div className="modal"><section className="panel"><h2>{policy}</h2><p>{ar ? `تفاصيل ${policy} لدى ${STORE_CONFIG.name} متاحة قبل تأكيد الطلب. للاستفسار تواصل معنا عبر واتساب.` : `Details about ${policy} are available before confirming your ${STORE_CONFIG.name} order. Contact us on WhatsApp for help.`}</p><button onClick={() => setPolicy("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
    </div>
  );
}
