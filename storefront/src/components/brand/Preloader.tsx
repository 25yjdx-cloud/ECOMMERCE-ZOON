"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";

const PRELOADER_KEY = "cf_preloader_seen";

export function Preloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      if (window.sessionStorage.getItem(PRELOADER_KEY) !== null) return;
      window.sessionStorage.setItem(PRELOADER_KEY, "1");
      setVisible(true);
      hideTimer = window.setTimeout(() => setVisible(false), 1300);
    }, 0);

    return () => {
      window.clearTimeout(showTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label="CommerceForge"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F3EEE3] dark:bg-[#1C1A18] brand-preloader"
      role="status"
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
    >
      <div className="brand-preloader-content">
        <BrandLogo size={86} variant="animated" />
        <span className="brand-preloader-rule" />
      </div>
    </div>
  );
}
