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
  name: "فريدة",
  nameEn: "Farida",
  logoUrl: "https://placehold.co/96x96/261a22/fff?text=F",
  colors: { background: "#f7f3f2", surface: "#fff", text: "#281d23", accent: "#8f5365" },
  heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=85",
  heroTitle: "أسلوبك، على طريقتك",
  heroTitleEn: "Your style, your way.",
  heroSubtitle: "قطع مختارة تجمع بين البساطة والتفاصيل التي تصنع الفرق.",
  heroSubtitleEn: "Thoughtfully selected pieces where simplicity meets the details that matter.",
  whatsapp: "201145335168",
  showPlatformBadge: true,
  categories: ["الكل", "فساتين", "حقائب", "إكسسوارات"],
  categoriesEn: ["All", "Dresses", "Bags", "Accessories"],
  coupon: "FARIDA10",
  freeShippingThreshold: 2500,
  shipping: { fee: 50, freeThreshold: 2500, requiresApproval: false, noteAr: "رسوم الشحن تُحدد حسب المحافظة.", noteEn: "Shipping fees vary by governorate." },
  products: [
    { id: "fashion-1", name: "فستان رِواء", nameEn: "Riwaa dress", category: "فساتين", categoryEn: "Dresses", price: 1890, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85", variants: ["S · وردي", "M · وردي", "L · أسود"], variantsEn: ["S · Rose", "M · Rose", "L · Black"] },
    { id: "fashion-2", name: "حقيبة مَدى", nameEn: "Mada bag", category: "حقائب", categoryEn: "Bags", price: 1450, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85", variants: ["صغير · بني", "متوسط · أسود"], variantsEn: ["Small · Brown", "Medium · Black"] },
    { id: "fashion-3", name: "قميص لين", nameEn: "Leen shirt", category: "فساتين", categoryEn: "Dresses", price: 1150, image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85", variants: ["S · أبيض", "M · أزرق", "L · أبيض"], variantsEn: ["S · White", "M · Blue", "L · White"] },
    { id: "fashion-4", name: "قلادة أثر", nameEn: "Athar necklace", category: "إكسسوارات", categoryEn: "Accessories", price: 620, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85", variants: ["ذهبي", "فضي"], variantsEn: ["Gold", "Silver"] },
  ],
};

type Line = { productId: string; variant: string; quantity: number };
type Locale = "ar" | "en";

export default function FashionStandalone({ locale = "ar" }: { locale?: Locale }) {
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
    <div className="cf-fashion" dir={ar ? "rtl" : "ltr"} lang={language}>
      <style>{`
        .cf-fashion{--bg:${STORE_CONFIG.colors.background};--surface:${STORE_CONFIG.colors.surface};--ink:${STORE_CONFIG.colors.text};--accent:${STORE_CONFIG.colors.accent};min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--font-arabic,"Cairo"),Arial,sans-serif}
        .cf-fashion[lang="en"]{font-family:var(--font-english,Arial),sans-serif}
        .cf-fashion *{box-sizing:border-box}.cf-fashion button,.cf-fashion input,.cf-fashion select{font:inherit}.cf-fashion button{cursor:pointer}
        .cf-fashion header{position:sticky;z-index:5;top:0;display:flex;justify-content:space-between;align-items:center;padding:1rem 6vw;background:#fffdf9eF;backdrop-filter:blur(10px)}
        .cf-fashion .brand{display:flex;align-items:center;gap:.7rem;font-weight:800;letter-spacing:.08em}.cf-fashion .brand img{width:38px;height:38px;border-radius:50%}
        .cf-fashion button,.cf-fashion input,.cf-fashion select{border:1px solid #ded5d5;border-radius:999px;background:var(--surface);color:inherit;padding:.7rem 1rem}
        .cf-fashion .hero{min-height:500px;display:flex;align-items:flex-end;padding:4rem 8vw;background:linear-gradient(0deg,#21151bbd,transparent 76%),url("${STORE_CONFIG.heroImage}") center/cover;color:white}
        .cf-fashion .hero div{max-width:560px}.cf-fashion h1{font-size:clamp(2.6rem,6vw,5.2rem);line-height:1.04;margin:.5rem 0}.cf-fashion .hero p{font-size:1.1rem}
        .cf-fashion main{padding:3rem 6vw}.cf-fashion .tools{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.4rem 0}.cf-fashion .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.2rem}
        .cf-fashion .card{background:var(--surface);overflow:hidden;animation:cf-fashion-rise .45s ease both}.cf-fashion .card img{width:100%;height:330px;object-fit:cover;transition:transform .38s cubic-bezier(.2,.8,.2,1)}.cf-fashion .card:hover img{transform:scale(1.055)}.cf-fashion .card:nth-child(2){animation-delay:.06s}.cf-fashion .card:nth-child(3){animation-delay:.12s}.cf-fashion .card:nth-child(4){animation-delay:.18s}.cf-fashion .body{padding:1rem}.cf-fashion .body h3{margin:.3rem 0}.cf-fashion .body select{width:100%;margin:.7rem 0}
        .cf-fashion .buy{width:100%;background:var(--accent);color:white;border-color:var(--accent);font-weight:700}.cf-fashion .drawer,.cf-fashion .modal{position:fixed;inset:0;z-index:9;background:#171015a8;display:flex;justify-content:flex-end}
        .cf-fashion .panel{width:min(440px,100%);height:100%;overflow:auto;background:var(--surface);padding:1.4rem}.cf-fashion .modal{align-items:center;justify-content:center;padding:1rem}.cf-fashion .modal .panel{height:auto;max-height:90vh;border-radius:1rem}
        .cf-fashion .line{display:flex;justify-content:space-between;border-bottom:1px solid #e6dddd;padding:.75rem 0}.cf-fashion footer{padding:2rem 6vw;background:#281d23;color:white;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}.cf-fashion footer button{background:none;color:inherit;border:0;text-decoration:underline}
        .cf-fashion .panel{animation:cf-fashion-panel .28s cubic-bezier(.2,.8,.2,1) both}.cf-fashion .tools>*{transition:border-color .2s,box-shadow .2s}.cf-fashion .tools>*:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);outline:0}.cf-fashion .cf-brand-badge{display:flex;align-items:center;gap:.45rem;font-size:.8rem;font-weight:800}.cf-fashion .cf-brand-badge svg{width:28px;height:28px}.cf-fashion .cf-brand-badge strong{color:#ff9a6f}.cf-fashion .cf-brand-tagline{display:block;font-size:.62rem;font-weight:500;opacity:.72}@keyframes cf-fashion-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes cf-fashion-panel{from{opacity:.7;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@media(max-width:850px){.cf-fashion .grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cf-fashion .card img{height:280px}}@media(max-width:520px){.cf-fashion .grid{grid-template-columns:1fr}.cf-fashion .card img{height:340px}}@media(prefers-reduced-motion:reduce){.cf-fashion *,.cf-fashion *::before,.cf-fashion *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>
      <style>{`
        .cf-fashion .drawer{justify-content:flex-start}
        .cf-fashion .drawer .panel{display:flex;flex-direction:column;overflow-y:auto;height:100dvh;padding-bottom:1rem}
        .cf-fashion .drawer .panel>.buy:last-child{position:sticky;bottom:-1rem;z-index:2;margin-top:auto}
      `}</style>
      <header><div className="brand"><Image alt="" height={48} src={STORE_CONFIG.logoUrl} unoptimized width={48} />{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn}</div><div><button onClick={() => { setVariants({}); setLanguage(ar ? "en" : "ar"); }} type="button">{ar ? "EN" : "عربي"}</button>{" "}<button onClick={() => setCartOpen(true)} type="button">{ar ? "الحقيبة" : "Bag"} ({cart.reduce((n, line) => n + line.quantity, 0)})</button></div></header>
      <section className="hero"><div><span>{ar ? "المجموعة الجديدة" : "New collection"}</span><h1>{ar ? STORE_CONFIG.heroTitle : STORE_CONFIG.heroTitleEn}</h1><p>{ar ? STORE_CONFIG.heroSubtitle : STORE_CONFIG.heroSubtitleEn}</p><a className="buy" href="#farida-products">{ar ? "تسوقي الآن" : "Shop now"}</a></div></section>
      <main id="farida-products"><h2>{ar ? "اختاري ما يشبهك" : "Find your own style"}</h2><div className="tools"><input onChange={(e) => setSearch(e.target.value)} placeholder={ar ? "ابحثي عن قطعة..." : "Search pieces..."} value={search} /><select onChange={(e) => setCategory(e.target.value)} value={category}>{STORE_CONFIG.categories.map((item, index) => <option key={item} value={item}>{ar ? item : STORE_CONFIG.categoriesEn[index]}</option>)}</select></div>
        <div className="grid">{products.map((product) => <article className="card" key={product.id}><Image alt={ar ? product.name : product.nameEn} height={300} loading="lazy" src={product.image} unoptimized width={400} /><div className="body"><small>{ar ? product.category : product.categoryEn}</small><h3>{ar ? product.name : product.nameEn}</h3><strong>{money(product.price)}</strong><select aria-label={ar ? "اختاري المقاس واللون" : "Choose size and color"} onChange={(e) => setVariants((v) => ({ ...v, [product.id]: e.target.value }))} value={variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0])}>{(ar ? product.variants : product.variantsEn).map((item) => <option key={item}>{item}</option>)}</select><button className="buy" onClick={() => add(product)} type="button">{ar ? "أضيفي للحقيبة" : "Add to bag"}</button></div></article>)}</div>
      </main>
      <footer><span>{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn} · {ar ? "مصممة لتكوني أنتِ" : "Made to feel like you"}</span>{STORE_CONFIG.showPlatformBadge && <span className="cf-brand-badge"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 29V14a12 12 0 0 1 24 0v15h-6V14a6 6 0 0 0-12 0v15H4Z" fill="currentColor"/><path d="M7 17h7l2-4h5l3 5 4 2-3 4h-7l-2 5-3-5H9l-2-7Z" fill="#D9541E"/></svg><span><strong>CommerceForge</strong><small className="cf-brand-tagline">{ar ? "من الفكرة إلى متجرك" : "From idea to store"}</small></span></span>}<div>{["الاستبدال والاسترجاع", "الشحن", "الخصوصية"].map((item) => <button key={item} onClick={() => setPolicy(item)} type="button">{ar ? item : item === "الشحن" ? "Shipping" : item === "الخصوصية" ? "Privacy" : "Returns"}</button>)}</div><a href={`https://wa.me/${STORE_CONFIG.whatsapp}`} rel="noreferrer" target="_blank">{ar ? "واتساب" : "WhatsApp"}</a></footer>
      {notice && <div className="modal" role="status"><section className="panel"><p>{notice}</p><button onClick={() => setNotice("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
      {cartOpen && <div className="drawer" onClick={() => setCartOpen(false)} role="presentation"><aside className="panel" onClick={(e) => e.stopPropagation()}><button onClick={() => setCartOpen(false)} type="button">×</button><h2>{ar ? "حقيبتك" : "Your bag"}</h2>{cart.map((line) => { const product = STORE_CONFIG.products.find((p) => p.id === line.productId)!; return <div className="line" key={`${line.productId}-${line.variant}`}><span>{ar ? product.name : product.nameEn} · {line.variant} × {line.quantity}</span><b>{money(product.price * line.quantity)}</b></div>; })}      <p>{ar ? "الإجمالي" : "Subtotal"}: {money(total)}</p><progress aria-label={ar ? "التقدم نحو الشحن المجاني" : "Free shipping progress"} max={100} value={Math.min(100, subtotal / STORE_CONFIG.freeShippingThreshold * 100)} /><p>{subtotal >= STORE_CONFIG.freeShippingThreshold ? (ar ? "أصبح الشحن مجانياً" : "Free shipping unlocked") : ar ? `أضف ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} للشحن المجاني` : `Add ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} for free shipping`}</p><div className="tools"><input onChange={(e) => setCoupon(e.target.value)} placeholder={ar ? "كود الخصم" : "Coupon"} value={coupon} /><button onClick={() => setDiscount(coupon.trim().toUpperCase() === STORE_CONFIG.coupon)} type="button">{ar ? "تطبيق" : "Apply"}</button></div>{discount && <p>{ar ? "خصم 10% مفعّل" : "10% discount applied"}</p>}<button className="buy" disabled={!cart.length} onClick={() => setCheckout(true)} type="button">{ar ? "إتمام الطلب" : "Checkout"}</button></aside></div>}
      {checkout && <div className="modal"><form className="panel" onSubmit={placeOrder}><h2>{ar ? "بيانات التوصيل" : "Delivery details"}</h2><input required minLength={2} placeholder={ar ? "الاسم" : "Name"} /><input required pattern="01[0125][0-9]{8}" placeholder={ar ? "رقم الهاتف" : "Phone"} /><input required minLength={5} placeholder={ar ? "العنوان" : "Address"} /><div className="tools"><button className="buy" type="submit">{ar ? "تأكيد الطلب التجريبي" : "Confirm demo order"}</button><button onClick={() => setCheckout(false)} type="button">{ar ? "إلغاء" : "Cancel"}</button></div></form></div>}
      {policy && <div className="modal"><section className="panel"><h2>{policy}</h2><p>{ar ? `تفاصيل ${policy} لدى ${STORE_CONFIG.name} متاحة قبل تأكيد الطلب. للاستفسار تواصلي معنا عبر واتساب.` : `Details about ${policy} are available before confirming your ${STORE_CONFIG.name} order. Contact us on WhatsApp for help.`}</p><button onClick={() => setPolicy("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
    </div>
  );
}
