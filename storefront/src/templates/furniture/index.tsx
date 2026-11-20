"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const furnitureTemplate = {
  id: "furniture",
  accent: "#78350F",
  surface: "#FAF7F2",
  Details({ locale, store }: TemplateModuleProps) {
    const rooms = store.categories.length
      ? store.categories.map((category) => category[locale])
      : locale === "ar"
        ? ["غرف معيشة", "غرف نوم", "مكاتب", "إضاءة"]
        : ["Living rooms", "Bedrooms", "Offices", "Lighting"];
    const [room, setRoom] = useState(rooms[0]);

    return (
      <section className="template-details template-details-furniture">
        <div className="template-room-filters" aria-label={locale === "ar" ? "اختر الغرفة" : "Choose a room"}>
          {rooms.map((item) => (
            <button aria-pressed={room === item} key={item} onClick={() => setRoom(item)} type="button">{item}</button>
          ))}
        </div>
        <div className="template-furniture-spec">
          <strong>{locale === "ar" ? "الشحن إلى المحافظات" : "Governorate delivery"}</strong>
          <span>{store.shipping.rates.length} {locale === "ar" ? "منطقة شحن مضبوطة" : "shipping areas configured"}</span>
          <span>{store.shipping.requires_approval
            ? locale === "ar" ? "تأكيد تكلفة الشحن مطلوب قبل إتمام الطلب." : "Shipping cost confirmation is required before checkout."
            : locale === "ar" ? "رسوم الشحن تُحسب حسب المحافظة." : "Shipping fees are calculated by governorate."}</span>
        </div>
      </section>
    );
  },
} as const;
