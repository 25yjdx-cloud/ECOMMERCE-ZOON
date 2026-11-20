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
  name: "دارك",
  nameEn: "Darak",
  logoUrl: "https://placehold.co/96x96/493a2a/fff?text=D",
  colors: { background: "#f4f0e9", surface: "#fffdfa", text: "#30271e", accent: "#8a6a42" },
  heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
  heroTitle: "مساحة تعكس ذوقك",
  heroTitleEn: "A space that feels like you.",
  heroSubtitle: "أثاث وديكور بخامات راقية وتفاصيل مصممة لتعيش طويلاً.",
  heroSubtitleEn: "Furniture and decor with considered materials and details made to last.",
  whatsapp: "201145335168",
  showPlatformBadge: true,
  categories: ["الكل", "كراسي", "طاولات", "إضاءة"],
  categoriesEn: ["All", "Seating", "Tables", "Lighting"],
  coupon: "DARAK10",
  freeShippingThreshold: 7000,
  shipping: { fee: 0, freeThreshold: null, requiresApproval: true, noteAr: "تكلفة الشحن والنقل تُحدّد وتُعتمد مع شركة الشحن وموافقة العميل قبل التأكيد النهائي.", noteEn: "Shipping and transport costs are agreed with the carrier and approved by the customer before final confirmation." },
  products: [
    { id: "furniture-1", name: "كرسي رواق", nameEn: "Riwaq chair", category: "كراسي", categoryEn: "Seating", price: 5200, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85", variants: ["بلوط · كتان", "جوز · رمادي"], variantsEn: ["Oak · Linen", "Walnut · Grey"] },
    { id: "furniture-2", name: "طاولة سُكون", nameEn: "Sukoon table", category: "طاولات", categoryEn: "Tables", price: 6900, image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=1000&q=85", variants: ["120 سم · بلوط", "160 سم · جوز"], variantsEn: ["120 cm · Oak", "160 cm · Walnut"] },
    { id: "furniture-3", name: "مصباح أُنس", nameEn: "Ons lamp", category: "إضاءة", categoryEn: "Lighting", price: 1750, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85", variants: ["نحاسي · دافئ", "أسود · طبيعي"], variantsEn: ["Copper · Warm", "Black · Natural"] },
    { id: "furniture-4", name: "مقعد نَسق", nameEn: "Nasaq bench", category: "كراسي", categoryEn: "Seating", price: 3400, image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=1000&q=85", variants: ["عاجي · بلوط", "رمادي · جوز"], variantsEn: ["Ivory · Oak", "Grey · Walnut"] },
  ],
};

type Line = { productId: string; variant: string; quantity: number };
type Locale = "ar" | "en";

export default function FurnitureStandalone({ locale = "ar" }: { locale?: Locale }) {
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
    <div className="cf-furniture" dir={ar ? "rtl" : "ltr"} lang={language}>
      <style>{`
        .cf-furniture{--bg:${STORE_CONFIG.colors.background};--surface:${STORE_CONFIG.colors.surface};--ink:${STORE_CONFIG.colors.text};--accent:${STORE_CONFIG.colors.accent};min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--font-arabic,"Cairo"),Georgia,serif}
        .cf-furniture[lang="en"]{font-family:Georgia,serif}
        .cf-furniture *{box-sizing:border-box}.cf-furniture button,.cf-furniture input,.cf-furniture select{font:inherit}.cf-furniture button{cursor:pointer}
        .cf-furniture header{position:sticky;z-index:5;top:0;display:flex;justify-content:space-between;align-items:center;padding:1.1rem 6vw;background:var(--surface)}
        .cf-furniture .brand{display:flex;align-items:center;gap:.7rem;font-weight:800;letter-spacing:.04em}.cf-furniture .brand img{width:42px;height:42px;border-radius:50%}
        .cf-furniture button,.cf-furniture input,.cf-furniture select{border:1px solid #d8d0c4;border-radius:.4rem;background:var(--surface);color:inherit;padding:.75rem 1rem}
        .cf-furniture .hero{min-height:500px;display:grid;align-items:center;padding:4rem 8vw;background:linear-gradient(90deg,#211b14c9,#211b1420),url("${STORE_CONFIG.heroImage}") center/cover;color:white}
        .cf-furniture .hero div{max-width:560px}.cf-furniture h1{font-size:clamp(2.4rem,5vw,4.7rem);line-height:1.1;margin:.6rem 0}.cf-furniture .hero p{font-size:1.1rem}
        .cf-furniture main{padding:3rem 6vw}.cf-furniture .tools{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.4rem 0}.cf-furniture .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.2rem}
        .cf-furniture .card{background:var(--surface);box-shadow:0 10px 24px #30271e12;animation:cf-furniture-rise .45s ease both}.cf-furniture .card img{width:100%;height:250px;object-fit:cover;transition:transform .38s cubic-bezier(.2,.8,.2,1)}.cf-furniture .card:hover img{transform:scale(1.045)}.cf-furniture .card:nth-child(2){animation-delay:.06s}.cf-furniture .card:nth-child(3){animation-delay:.12s}.cf-furniture .card:nth-child(4){animation-delay:.18s}.cf-furniture .body{padding:1rem}.cf-furniture .body h3{margin:.3rem 0}.cf-furniture .body select{width:100%;margin:.7rem 0}
        .cf-furniture .buy{width:100%;border:0;background:var(--accent);color:white;font-weight:700}.cf-furniture .drawer,.cf-furniture .modal{position:fixed;inset:0;z-index:9;background:#17130eb8;display:flex;justify-content:flex-end}
        .cf-furniture .panel{width:min(440px,100%);height:100%;overflow:auto;background:var(--surface);padding:1.4rem}.cf-furniture .modal{align-items:center;justify-content:center;padding:1rem}.cf-furniture .modal .panel{height:auto;max-height:90vh}
        .cf-furniture .line{display:flex;justify-content:space-between;border-bottom:1px solid #e3ddd3;padding:.75rem 0}.cf-furniture footer{padding:2rem 6vw;background:#30271e;color:white;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}.cf-furniture footer button{background:none;color:inherit;border:0;text-decoration:underline}
        .cf-furniture .panel{animation:cf-furniture-panel .28s cubic-bezier(.2,.8,.2,1) both}.cf-furniture .tools>*{transition:border-color .2s,box-shadow .2s}.cf-furniture .tools>*:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);outline:0}.cf-furniture .cf-brand-badge{display:flex;align-items:center;gap:.45rem;font-size:.8rem;font-weight:800}.cf-furniture .cf-brand-badge svg{width:28px;height:28px}.cf-furniture .cf-brand-badge strong{color:#ff9a6f}.cf-furniture .cf-brand-tagline{display:block;font-size:.62rem;font-weight:500;opacity:.72}@keyframes cf-furniture-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes cf-furniture-panel{from{opacity:.7;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@media(max-width:850px){.cf-furniture .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.cf-furniture .grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.cf-furniture *,.cf-furniture *::before,.cf-furniture *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>
      <style>{`
        .cf-furniture .drawer{justify-content:flex-start}
        .cf-furniture .drawer .panel{display:flex;flex-direction:column;overflow-y:auto;height:100dvh;padding-bottom:1rem}
        .cf-furniture .drawer .panel>.buy:last-child{position:sticky;bottom:-1rem;z-index:2;margin-top:auto}
        .cf-furniture .drawer .panel::before{content:"${STORE_CONFIG.shipping.noteAr}";position:sticky;bottom:3.6rem;z-index:1;order:3;margin-top:auto;border-inline-start:3px solid var(--accent);background:var(--surface);padding:.65rem;color:var(--ink);font-size:.84rem}
        .cf-furniture .drawer .panel>button.buy:last-child{order:4}
        .cf-furniture .drawer progress[aria-label*="الشحن المجاني"],.cf-furniture .drawer progress[aria-label*="Free shipping"],.cf-furniture .drawer progress+p{display:none}
      `}</style>
      <header><div className="brand"><img alt="" src={STORE_CONFIG.logoUrl} />{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn}</div><div><button onClick={() => { setVariants({}); setLanguage(ar ? "en" : "ar"); }} type="button">{ar ? "EN" : "عربي"}</button>{" "}<button onClick={() => setCartOpen(true)} type="button">{ar ? "السلة" : "Cart"} ({cart.reduce((n, line) => n + line.quantity, 0)})</button></div></header>
      <section className="hero"><div><span>{ar ? "تصميم يدوم" : "Timeless design"}</span><h1>{ar ? STORE_CONFIG.heroTitle : STORE_CONFIG.heroTitleEn}</h1><p>{ar ? STORE_CONFIG.heroSubtitle : STORE_CONFIG.heroSubtitleEn}</p><a className="buy" href="#darak-products">{ar ? "اكتشف المجموعة" : "Explore collection"}</a></div></section>
      <main id="darak-products"><h2>{ar ? "قطع مختارة لمساحتك" : "Pieces for your space"}</h2><div className="tools"><input onChange={(e) => setSearch(e.target.value)} placeholder={ar ? "ابحث عن قطعة..." : "Search pieces..."} value={search} /><select onChange={(e) => setCategory(e.target.value)} value={category}>{STORE_CONFIG.categories.map((item, index) => <option key={item} value={item}>{ar ? item : STORE_CONFIG.categoriesEn[index]}</option>)}</select></div>
        <div className="grid">{products.map((product) => <article className="card" key={product.id}><img alt={ar ? product.name : product.nameEn} loading="lazy" src={product.image} /><div className="body"><small>{ar ? product.category : product.categoryEn}</small><h3>{ar ? product.name : product.nameEn}</h3><strong>{money(product.price)}</strong><select aria-label={ar ? "الخامة والمقاس" : "Material and size"} onChange={(e) => setVariants((v) => ({ ...v, [product.id]: e.target.value }))} value={variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0])}>{(ar ? product.variants : product.variantsEn).map((item) => <option key={item}>{item}</option>)}</select><button className="buy" onClick={() => add(product)} type="button">{ar ? "أضف إلى السلة" : "Add to cart"}</button></div></article>)}</div>
      </main>
      <footer><span>{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn} · {ar ? "مساحات تحكي عنك" : "Spaces with a story"}</span>{STORE_CONFIG.showPlatformBadge && <span className="cf-brand-badge"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 29V14a12 12 0 0 1 24 0v15h-6V14a6 6 0 0 0-12 0v15H4Z" fill="currentColor"/><path d="M7 17h7l2-4h5l3 5 4 2-3 4h-7l-2 5-3-5H9l-2-7Z" fill="#D9541E"/></svg><span><strong>CommerceForge</strong><small className="cf-brand-tagline">{ar ? "من الفكرة إلى متجرك" : "From idea to store"}</small></span></span>}<div>{["الاستبدال والاسترجاع", "الشحن", "الخصوصية"].map((item) => <button key={item} onClick={() => setPolicy(item)} type="button">{ar ? item : item === "الشحن" ? "Shipping" : item === "الخصوصية" ? "Privacy" : "Returns"}</button>)}</div><a href={`https://wa.me/${STORE_CONFIG.whatsapp}`} rel="noreferrer" target="_blank">{ar ? "واتساب" : "WhatsApp"}</a></footer>
      {notice && <div className="modal" role="status"><section className="panel"><p>{notice}</p><button onClick={() => setNotice("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
      {cartOpen && <div className="drawer" onClick={() => setCartOpen(false)} role="presentation"><aside className="panel" onClick={(e) => e.stopPropagation()}><button onClick={() => setCartOpen(false)} type="button">×</button><h2>{ar ? "سلة التسوق" : "Shopping cart"}</h2>{cart.map((line) => { const product = STORE_CONFIG.products.find((p) => p.id === line.productId)!; return <div className="line" key={`${line.productId}-${line.variant}`}><span>{ar ? product.name : product.nameEn} · {line.variant} × {line.quantity}</span><b>{money(product.price * line.quantity)}</b></div>; })}      <p>{ar ? "الإجمالي" : "Subtotal"}: {money(total)}</p><progress aria-label={ar ? "التقدم نحو الشحن المجاني" : "Free shipping progress"} max={100} value={Math.min(100, subtotal / STORE_CONFIG.freeShippingThreshold * 100)} /><p>{subtotal >= STORE_CONFIG.freeShippingThreshold ? (ar ? "أصبح الشحن مجانياً" : "Free shipping unlocked") : ar ? `أضف ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} للشحن المجاني` : `Add ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} for free shipping`}</p><div className="tools"><input onChange={(e) => setCoupon(e.target.value)} placeholder={ar ? "كود الخصم" : "Coupon"} value={coupon} /><button onClick={() => setDiscount(coupon.trim().toUpperCase() === STORE_CONFIG.coupon)} type="button">{ar ? "تطبيق" : "Apply"}</button></div>{discount && <p>{ar ? "خصم 10% مفعّل" : "10% discount applied"}</p>}<button className="buy" disabled={!cart.length} onClick={() => setCheckout(true)} type="button">{ar ? "إتمام الطلب" : "Checkout"}</button></aside></div>}
      {checkout && <div className="modal"><form className="panel" onSubmit={placeOrder}><h2>{ar ? "بيانات التوصيل" : "Delivery details"}</h2><input required minLength={2} placeholder={ar ? "الاسم" : "Name"} /><input required pattern="01[0125][0-9]{8}" placeholder={ar ? "رقم الهاتف" : "Phone"} /><input required minLength={5} placeholder={ar ? "العنوان" : "Address"} /><div className="tools"><button className="buy" type="submit">{ar ? "تأكيد الطلب التجريبي" : "Confirm demo order"}</button><button onClick={() => setCheckout(false)} type="button">{ar ? "إلغاء" : "Cancel"}</button></div></form></div>}
      {policy && <div className="modal"><section className="panel"><h2>{policy}</h2><p>{ar ? `يمكنك مراجعة تفاصيل ${policy} لدى ${STORE_CONFIG.name} قبل الشراء. تواصل معنا عبر واتساب للمساعدة.` : `Review ${policy.toLowerCase()} details before purchasing from ${STORE_CONFIG.name}. Contact us on WhatsApp for help.`}</p><button onClick={() => setPolicy("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
    </div>
  );
}
