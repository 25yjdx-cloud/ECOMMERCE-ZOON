"use client";

import { useState } from "react";
import type { MockLocale } from "@/mock/types";

type Panel = "orders" | "inventory" | "pixels" | "branding";

const sampleOrders = [
  { id: "#IOY842", customer: "سارة أحمد", items: 2, total: "1,680 ج.م", status: "قيد التجهيز" },
  { id: "#IOY841", customer: "محمود علي", items: 1, total: "790 ج.م", status: "جديد" },
  { id: "#IOY840", customer: "نور حسن", items: 3, total: "2,420 ج.م", status: "تم الشحن" },
];

export function StandaloneAdminDemo({ locale, storeName }: { locale: MockLocale; storeName: string }) {
  const [panel, setPanel] = useState<Panel>("orders");
  const [color, setColor] = useState("#D9541E");
  const [pixelId, setPixelId] = useState("");
  const ar = locale === "ar";
  const panels: { id: Panel; ar: string; en: string }[] = [
    { id: "orders", ar: "الطلبات", en: "Orders" },
    { id: "inventory", ar: "المخزون والباركود", en: "Inventory & barcode" },
    { id: "pixels", ar: "البيكسل", en: "Pixels" },
    { id: "branding", ar: "الهوية", en: "Branding" },
  ];

  return (
    <main className="admin-demo-shell" dir={ar ? "rtl" : "ltr"}>
      <header className="admin-demo-heading">
        <div>
          <span className="eyebrow">{ar ? "بيئة تجريبية — بيانات توضيحية فقط" : "Sandbox — sample data only"}</span>
          <h1>{ar ? `لوحة إدارة ${storeName}` : `${storeName} admin panel`}</h1>
          <p>{ar ? "تفاعل مع معاينة للطلبات والمخزون وإعدادات العلامة التجارية." : "Explore a demo of orders, inventory, and brand settings."}</p>
        </div>
        <strong className="admin-demo-sandbox-tag">{ar ? "غير متصل ببيانات متجر حقيقي" : "Not connected to a live store"}</strong>
      </header>
      <nav aria-label={ar ? "أقسام لوحة الإدارة" : "Admin sections"} className="admin-demo-tabs">
        {panels.map((item) => (
          <button aria-pressed={panel === item.id} key={item.id} onClick={() => setPanel(item.id)} type="button">
            {ar ? item.ar : item.en}
          </button>
        ))}
      </nav>
      <section className="admin-demo-panel">
        {panel === "orders" && (
          <>
            <h2>{ar ? "الطلبات الأخيرة" : "Recent orders"}</h2>
            <div className="admin-demo-table">
              {sampleOrders.map((order) => (
                <article className="admin-demo-row" key={order.id}>
                  <strong>{order.id}</strong><span>{order.customer}</span><span>{order.items} {ar ? "منتج" : "items"}</span>
                  <span>{order.total}</span><span className="status-pill">{order.status}</span>
                </article>
              ))}
            </div>
            <button className="button-link secondary" onClick={() => window.print()} type="button">{ar ? "طباعة بوليصة تجريبية" : "Print demo waybill"}</button>
          </>
        )}
        {panel === "inventory" && (
          <>
            <h2>{ar ? "المخزون والباركود" : "Inventory & barcode"}</h2>
            <div className="admin-demo-inventory">
              <div><strong>{ar ? "تيشيرت المدينة" : "City tee"}</strong><p>{ar ? "SKU: HAW-TEE-001 · مقاس M · أسود" : "SKU: HAW-TEE-001 · Size M · Black"}</p><span className="stock-warning">{ar ? "متبقي 3 قطع" : "3 items left"}</span></div>
              <svg aria-label={ar ? "باركود تجريبي" : "Demo barcode"} height="66" role="img" viewBox="0 0 220 66" width="220">
                <rect height="66" width="220" fill="white" />
                {[4, 10, 17, 26, 31, 39, 46, 53, 61, 69, 74, 83, 91, 96, 105, 113, 120, 128, 136, 141, 150, 158, 163, 172, 181, 188, 195, 205].map((x, index) => <rect fill="#111" height={index % 3 ? 44 : 52} key={x} width={index % 4 === 0 ? 3 : 2} x={x} y="4" />)}
                <text fill="#111" fontSize="10" x="76" y="62">HAW-TEE-001</text>
              </svg>
            </div>
            <button className="button-link secondary" onClick={() => window.print()} type="button">{ar ? "طباعة ملصق تجريبي" : "Print demo label"}</button>
          </>
        )}
        {panel === "pixels" && (
          <div className="admin-demo-form">
            <h2>{ar ? "إعدادات البيكسل التسويقي" : "Marketing pixel settings"}</h2>
            <label>{ar ? "Meta Pixel ID" : "Meta Pixel ID"}<input inputMode="numeric" onChange={(event) => setPixelId(event.target.value)} placeholder="1234567890" value={pixelId} /></label>
            <label>{ar ? "TikTok Pixel ID" : "TikTok Pixel ID"}<input placeholder="TikTok pixel ID" /></label>
            <label>{ar ? "Snapchat Pixel ID" : "Snapchat Pixel ID"}<input placeholder="Snapchat pixel ID" /></label>
            <p role="status">{pixelId ? (ar ? "تم حفظ القيمة في المعاينة فقط." : "Saved in this preview only.") : (ar ? "لن تُحفظ البيانات أو تُحقن أكواد التتبع في هذا العرض." : "Values are not persisted and no tracking scripts run in this demo.")}</p>
          </div>
        )}
        {panel === "branding" && (
          <div className="admin-demo-form">
            <h2>{ar ? "تخصيص الهوية" : "Brand customization"}</h2>
            <label>{ar ? "لون العلامة" : "Brand color"}<input onChange={(event) => setColor(event.target.value)} type="color" value={color} /></label>
            <div className="admin-demo-brand-preview" style={{ borderColor: color }}><strong style={{ color }}>{storeName}</strong><span>{ar ? "معاينة حية للهوية" : "Live identity preview"}</span></div>
          </div>
        )}
      </section>
    </main>
  );
}
