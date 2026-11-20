"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  price: number;
  image: string;
  variants: string[];
  variantsEn: string[];
};

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
  name: "بيت الحكاية",
  nameEn: "Tale House",
  logoUrl: "https://placehold.co/96x96/7c3f2c/fff?text=BH",
  colors: { background: "#f7f1e9", surface: "#fffdf9", text: "#34251f", accent: "#9b5638" },
  heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
  heroTitle: "تفاصيل صغيرة، حكايات تدوم",
  heroTitleEn: "Little details. Stories that last.",
  heroSubtitle: "هدايا وقطع ديكور مختارة بعناية لتضيف دفئاً إلى كل ركن.",
  heroSubtitleEn: "Thoughtfully selected gifts and decor to bring warmth to every corner.",
  whatsapp: "201145335168",
  showPlatformBadge: true,
  categories: ["الكل", "ديكور", "هدايا", "إضاءة"],
  categoriesEn: ["All", "Decor", "Gifts", "Lighting"],
  coupon: "WELCOME10",
  freeShippingThreshold: 1800,
  shipping: { fee: 50, freeThreshold: 1800, requiresApproval: false, noteAr: "رسوم الشحن تُحدد حسب المحافظة.", noteEn: "Shipping fees vary by governorate." },
  products: [
    { id: "classic-1", name: "مزهرية ريفية", nameEn: "Rustic vase", category: "ديكور", categoryEn: "Decor", price: 680, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85", variants: ["صغير · عاجي", "كبير · طيني"], variantsEn: ["Small · Ivory", "Large · Clay"] },
    { id: "classic-2", name: "مصباح ليالي", nameEn: "Layali lamp", category: "إضاءة", categoryEn: "Lighting", price: 1250, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", variants: ["خشب · دافئ", "أسود · دافئ"], variantsEn: ["Wood · Warm", "Black · Warm"] },
    { id: "classic-3", name: "صندوق هدايا", nameEn: "Gift box", category: "هدايا", categoryEn: "Gifts", price: 540, image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=85", variants: ["صغير · بيج", "كبير · أخضر"], variantsEn: ["Small · Beige", "Large · Green"] },
    { id: "classic-4", name: "مرآة شمسية", nameEn: "Sunburst mirror", category: "ديكور", categoryEn: "Decor", price: 980, image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85", variants: ["ذهبي · 50 سم", "نحاسي · 70 سم"], variantsEn: ["Gold · 50 cm", "Copper · 70 cm"] },
  ],
};

type CartLine = { productId: string; variant: string; quantity: number };
type Locale = "ar" | "en";

export default function ClassicStandalone({ locale = "ar" }: { locale?: Locale }) {
  const [language, setLanguage] = useState<Locale>(locale);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(STORE_CONFIG.categories[0]);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [policy, setPolicy] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const ar = language === "ar";
  const visibleProducts = useMemo(() => STORE_CONFIG.products.filter((product) =>
    (category === STORE_CONFIG.categories[0] || product.category === category)
    && `${ar ? product.name : product.nameEn} ${ar ? product.category : product.categoryEn}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  ), [ar, category, search]);
  const subtotal = cart.reduce((sum, line) => sum + (STORE_CONFIG.products.find((product) => product.id === line.productId)?.price ?? 0) * line.quantity, 0);
  const total = Math.max(0, subtotal - (discount ? Math.round(subtotal * 0.1) : 0));
  const money = (value: number) => new Intl.NumberFormat(ar ? "ar-EG" : "en-US", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(value);

  function addProduct(product: Product) {
    const variant = variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0]);
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id && line.variant === variant);
      return existing
        ? current.map((line) => line === existing ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { productId: product.id, variant, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation(ar ? "تم استلام طلبك التجريبي بنجاح." : "Your demo order has been received.");
    setCart([]);
    setCheckoutOpen(false);
  }

  return (
    <div className="cf-classic" dir={ar ? "rtl" : "ltr"} lang={language}>
      <style>{`
        .cf-classic{--bg:${STORE_CONFIG.colors.background};--surface:${STORE_CONFIG.colors.surface};--ink:${STORE_CONFIG.colors.text};--accent:${STORE_CONFIG.colors.accent};min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--font-arabic,"Cairo"),Arial,sans-serif}
        .cf-classic[lang="en"]{font-family:var(--font-english,Arial),sans-serif}
        .cf-classic *{box-sizing:border-box}.cf-classic button,.cf-classic input,.cf-classic select{font:inherit}.cf-classic button{cursor:pointer}
        .cf-classic .top{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem max(5vw,1rem);background:var(--surface);position:sticky;top:0;z-index:5;box-shadow:0 2px 20px #34251f12}
        .cf-classic .brand{display:flex;align-items:center;gap:.7rem;font-weight:800}.cf-classic .brand img{width:42px;height:42px;border-radius:50%}
        .cf-classic .top button,.cf-classic .outline{border:1px solid #d8cbbd;background:transparent;color:inherit;border-radius:999px;padding:.6rem 1rem}
        .cf-classic .hero{min-height:390px;background:linear-gradient(90deg,#241a17aa,#241a1730),url("${STORE_CONFIG.heroImage}") center/cover;display:flex;align-items:center;padding:3rem max(7vw,1rem);color:white;animation:cf-rise .7s ease both}
        .cf-classic .hero-copy{max-width:560px}.cf-classic h1{font-size:clamp(2.2rem,5vw,4.4rem);line-height:1.15;margin:.3rem 0 1rem}.cf-classic .hero p{font-size:1.1rem}
        .cf-classic .products{padding:3rem max(5vw,1rem)}.cf-classic .tools{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.5rem 0}.cf-classic input,.cf-classic select{border:1px solid #d8cbbd;border-radius:.75rem;background:var(--surface);color:inherit;padding:.75rem;min-width:180px}
        .cf-classic .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.1rem}.cf-classic .card{background:var(--surface);border-radius:1rem;overflow:hidden;box-shadow:0 8px 26px #34251f12;animation:cf-rise .5s ease both}.cf-classic .card img{width:100%;height:220px;object-fit:cover;transition:transform .38s cubic-bezier(.2,.8,.2,1)}.cf-classic .card:hover img{transform:scale(1.055)}.cf-classic .card:nth-child(2){animation-delay:.06s}.cf-classic .card:nth-child(3){animation-delay:.12s}.cf-classic .card:nth-child(4){animation-delay:.18s}.cf-classic .card-body{padding:1rem}.cf-classic .card h3{margin:.2rem 0}.cf-classic .muted{opacity:.68}
        .cf-classic .primary{border:0;border-radius:999px;background:var(--accent);color:white;padding:.75rem 1.1rem;font-weight:700}.cf-classic .card .primary{width:100%;margin-top:.7rem}.cf-classic .drawer,.cf-classic .modal{position:fixed;inset:0;z-index:10;background:#17110f88;display:flex;justify-content:flex-end}.cf-classic .drawer-panel,.cf-classic .modal-panel{background:var(--surface);color:var(--ink);padding:1.4rem;width:min(440px,100%);height:100%;overflow:auto;box-shadow:0 0 40px #0002}.cf-classic .modal{align-items:center;justify-content:center;padding:1rem}.cf-classic .modal-panel{height:auto;max-height:90vh;border-radius:1rem}.cf-classic .line{display:flex;justify-content:space-between;gap:1rem;border-bottom:1px solid #ddd;padding:.7rem 0}.cf-classic .footer{padding:2rem max(5vw,1rem);background:#34251f;color:white;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}.cf-classic .footer button{border:0;background:transparent;color:inherit;text-decoration:underline}
        .cf-classic .drawer-panel{animation:cf-panel-in .3s cubic-bezier(.2,.8,.2,1) both}.cf-classic .modal-panel{animation:cf-rise .24s ease both}.cf-classic .tools>*{transition:border-color .2s,box-shadow .2s}.cf-classic .tools>*:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent);outline:0}.cf-classic .cf-brand-badge{display:flex;align-items:center;gap:.45rem;font-size:.8rem;font-weight:800}.cf-classic .cf-brand-badge svg{width:28px;height:28px}.cf-classic .cf-brand-badge strong{color:#ff9a6f}.cf-classic .cf-brand-tagline{display:block;font-size:.62rem;font-weight:500;opacity:.72}
        @keyframes cf-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes cf-panel-in{from{opacity:.7;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}@media(max-width:850px){.cf-classic .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.cf-classic .grid{grid-template-columns:1fr}.cf-classic .card img{height:250px}.cf-classic .hero{min-height:320px}}@media(prefers-reduced-motion:reduce){.cf-classic *,.cf-classic *::before,.cf-classic *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
      `}</style>
      <style>{`
        .cf-classic .drawer{justify-content:flex-start}
        .cf-classic .drawer-panel{display:flex;flex-direction:column;overflow-y:auto;height:100dvh;padding-bottom:1rem}
        .cf-classic .drawer-panel>.primary:last-child{position:sticky;bottom:-1rem;z-index:2;margin-top:auto}
      `}</style>
      <header className="top">
        <div className="brand"><Image alt="" height={48} src={STORE_CONFIG.logoUrl} unoptimized width={48} /><span>{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn}</span></div>
        <div>
          <button onClick={() => { setVariants({}); setLanguage(ar ? "en" : "ar"); }} type="button">{ar ? "EN" : "عربي"}</button>{" "}
          <button onClick={() => setCartOpen(true)} type="button">{ar ? "السلة" : "Cart"} ({cart.reduce((sum, line) => sum + line.quantity, 0)})</button>
        </div>
      </header>
      <section className="hero"><div className="hero-copy"><span>{ar ? "مختارات بعناية" : "Curated with care"}</span><h1>{ar ? STORE_CONFIG.heroTitle : STORE_CONFIG.heroTitleEn}</h1><p>{ar ? STORE_CONFIG.heroSubtitle : STORE_CONFIG.heroSubtitleEn}</p><a className="primary" href="#catalog">{ar ? "تسوق المجموعة" : "Shop collection"}</a></div></section>
      <main className="products" id="catalog">
        <h2>{ar ? "اكتشف مجموعتنا" : "Discover the collection"}</h2>
        <div className="tools">
          <input aria-label={ar ? "بحث" : "Search"} onChange={(event) => setSearch(event.target.value)} placeholder={ar ? "ابحث عن منتج..." : "Search products..."} value={search} />
          <select aria-label={ar ? "القسم" : "Category"} onChange={(event) => setCategory(event.target.value)} value={category}>
            {STORE_CONFIG.categories.map((item, index) => <option key={item} value={item}>{ar ? item : STORE_CONFIG.categoriesEn[index]}</option>)}
          </select>
        </div>
        <div className="grid">{visibleProducts.map((product) => (
          <article className="card" key={product.id}>
            <Image alt={ar ? product.name : product.nameEn} height={300} loading="lazy" src={product.image} unoptimized width={400} />
            <div className="card-body"><span className="muted">{ar ? product.category : product.categoryEn}</span><h3>{ar ? product.name : product.nameEn}</h3><strong>{money(product.price)}</strong>
              <div><select aria-label={ar ? "اختر المقاس واللون" : "Choose size and color"} onChange={(event) => setVariants((current) => ({ ...current, [product.id]: event.target.value }))} value={variants[product.id] ?? (ar ? product.variants[0] : product.variantsEn[0])}>{(ar ? product.variants : product.variantsEn).map((item) => <option key={item}>{item}</option>)}</select></div>
              <button className="primary" onClick={() => addProduct(product)} type="button">{ar ? "أضف إلى السلة" : "Add to cart"}</button>
            </div>
          </article>
        ))}</div>
      </main>
      <footer className="footer">
        <span>{ar ? STORE_CONFIG.name : STORE_CONFIG.nameEn} · {ar ? "تجربة متجر مكتملة للمعاينة" : "Completed store experience preview"}</span>
        {STORE_CONFIG.showPlatformBadge && <span className="cf-brand-badge"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 29V14a12 12 0 0 1 24 0v15h-6V14a6 6 0 0 0-12 0v15H4Z" fill="currentColor"/><path d="M7 17h7l2-4h5l3 5 4 2-3 4h-7l-2 5-3-5H9l-2-7Z" fill="#D9541E"/></svg><span><strong>CommerceForge</strong><small className="cf-brand-tagline">{ar ? "من الفكرة إلى متجرك" : "From idea to store"}</small></span></span>}
        <div>{["الاستبدال والاسترجاع", "الشحن", "الخصوصية"].map((item) => <button key={item} onClick={() => setPolicy(item)} type="button">{item}</button>)}</div>
        <a href={`https://wa.me/${STORE_CONFIG.whatsapp}`} rel="noreferrer" target="_blank">{ar ? "تواصل عبر واتساب" : "WhatsApp"}</a>
      </footer>
      {confirmation && <div className="modal" role="status"><div className="modal-panel"><p>{confirmation}</p><button className="primary" onClick={() => setConfirmation("")} type="button">{ar ? "حسناً" : "OK"}</button></div></div>}
      {cartOpen && <div className="drawer" onClick={() => setCartOpen(false)} role="presentation"><aside className="drawer-panel" onClick={(event) => event.stopPropagation()}><button className="outline" onClick={() => setCartOpen(false)} type="button">×</button><h2>{ar ? "سلة التسوق" : "Shopping cart"}</h2>
        {cart.map((line) => { const product = STORE_CONFIG.products.find((item) => item.id === line.productId)!; return <div className="line" key={`${line.productId}-${line.variant}`}><span>{ar ? product.name : product.nameEn}<small className="muted"> · {line.variant} × {line.quantity}</small></span><strong>{money(product.price * line.quantity)}</strong></div>; })}
        <p>{ar ? "الإجمالي" : "Subtotal"}: <strong>{money(total)}</strong></p><progress aria-label={ar ? "التقدم نحو الشحن المجاني" : "Free shipping progress"} max={100} value={Math.min(100, subtotal / STORE_CONFIG.freeShippingThreshold * 100)} /><p className="muted">{subtotal >= STORE_CONFIG.freeShippingThreshold ? (ar ? "أصبح الشحن مجانياً" : "Free shipping unlocked") : ar ? `أضف ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} للشحن المجاني` : `Add ${money(STORE_CONFIG.freeShippingThreshold - subtotal)} for free shipping`}</p>
        <div className="tools"><input onChange={(event) => setCoupon(event.target.value)} placeholder={ar ? "كود الخصم" : "Coupon code"} value={coupon} /><button className="outline" onClick={() => setDiscount(coupon.trim().toUpperCase() === STORE_CONFIG.coupon)} type="button">{ar ? "تطبيق" : "Apply"}</button></div>
        {discount && <p>{ar ? "تم تطبيق خصم 10%" : "10% discount applied"}</p>}<button className="primary" disabled={!cart.length} onClick={() => setCheckoutOpen(true)} type="button">{ar ? "إتمام الطلب" : "Checkout"}</button>
      </aside></div>}
      {checkoutOpen && <div className="modal"><form className="modal-panel" onSubmit={submitCheckout}><h2>{ar ? "بيانات التوصيل" : "Delivery details"}</h2><input required minLength={2} placeholder={ar ? "الاسم" : "Name"} /><input required inputMode="tel" pattern="01[0125][0-9]{8}" placeholder={ar ? "رقم الهاتف" : "Phone"} /><input required minLength={5} placeholder={ar ? "العنوان" : "Address"} /><div className="tools"><button className="primary" type="submit">{ar ? "تأكيد الطلب التجريبي" : "Confirm demo order"}</button><button className="outline" onClick={() => setCheckoutOpen(false)} type="button">{ar ? "إلغاء" : "Cancel"}</button></div></form></div>}
      {policy && <div className="modal"><section className="modal-panel"><h2>{policy}</h2><p>{ar ? `نلتزم في ${STORE_CONFIG.name} بتوضيح تفاصيل ${policy} قبل تأكيد طلبك. تواصل معنا عبر واتساب لأي استفسار.` : `${STORE_CONFIG.name} provides clear ${policy.toLowerCase()} details before order confirmation. Contact us on WhatsApp with questions.`}</p><button className="primary" onClick={() => setPolicy("")} type="button">{ar ? "إغلاق" : "Close"}</button></section></div>}
    </div>
  );
}
