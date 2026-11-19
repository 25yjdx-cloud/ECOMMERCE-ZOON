"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const furnitureTemplate = {
  id: "furniture",
  accent: "#78350F",
  surface: "#FAF7F2",
  Details({ locale }: TemplateModuleProps) {
    const rooms = locale === "ar"
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
          <strong>{locale === "ar" ? "الأبعاد" : "Dimensions"}</strong>
          <span>220×90×85 {locale === "ar" ? "سم" : "cm"}</span>
          <span>{locale === "ar" ? "خشب زان · كتان بيج" : "Beech wood · beige linen"}</span>
        </div>
      </section>
    );
  },
} as const;
