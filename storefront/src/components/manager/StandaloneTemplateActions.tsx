"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function StandaloneTemplateActions({ slug }: { slug: string }) {
  const [message, setMessage] = useState("");

  async function copyTemplate() {
    setMessage("");
    try {
      const response = await fetch(`/api/manager/standalone/${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (!response.ok) {
        setMessage("تعذر تحميل ملف القالب.");
        return;
      }

      await navigator.clipboard.writeText(await response.text());
      setMessage("تم نسخ الملف.");
    } catch (error) {
      if (error instanceof TypeError || error instanceof DOMException) {
        setMessage("تعذر النسخ. تحقق من صلاحية الحافظة وحاول التنزيل.");
        return;
      }

      throw error;
    }
  }

  return (
    <div className="manager-template-actions">
      <button className="button-link secondary" onClick={() => void copyTemplate()} type="button"><BrandLogo size={19} variant="mark" />نسخ ملف القالب المستقل</button>
      <a className="button-link secondary" download={`${slug}.standalone.tsx`} href={`/api/manager/standalone/${encodeURIComponent(slug)}`}>
        <BrandLogo size={19} variant="mark" />تحميل ملف القالب المستقل
      </a>
      {message && <span role="status">{message}</span>}
    </div>
  );
}
