"use client";

import React from "react";

export type BrandLogoVariant = "full" | "horizontal" | "mark" | "watermark" | "animated";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: number;
  className?: string;
  showArabicSubtitle?: boolean;
}

export function BrandLogo({
  variant = "horizontal",
  size = 38,
  className = "",
  showArabicSubtitle = true,
}: BrandLogoProps) {
  const isWatermark = variant === "watermark";
  const isAnimated = variant === "animated";

  const svgMark = (
    <svg
      width={isWatermark ? 120 : size}
      height={isWatermark ? 96 : Math.round(size * 0.8)}
      viewBox="0 0 140 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={isAnimated ? "cf-logo-svg cf-logo-animated" : "cf-logo-svg"}
    >
      <path
        className="cf-logo-arch"
        d="M56 96H16V44C16 29.6406 27.6406 18 42 18C56.3594 18 68 29.6406 68 44V52H56V44C56 36.268 49.732 30 42 30C34.268 30 28 36.268 28 44V84H56V96Z"
        fill="currentColor"
      />
      <path
        className="cf-logo-handle"
        d="M35 47C35 43.134 38.134 40 42 40C45.866 40 49 43.134 49 47H45.5C45.5 45.067 43.933 43.5 42 43.5C40.067 43.5 38.5 45.067 38.5 47H35Z"
        fill="currentColor"
      />
      <path className="cf-logo-basin" d="M32 51H68V68C48 68 33 61 32 51Z" fill="#D9541E" />
      <rect className="cf-logo-crown-1" x="72" y="18" width="16" height="25" fill="#D9541E" />
      <path className="cf-logo-crown-2" d="M92 18H100L106 25V43H92V18Z" fill="currentColor" />
      <path className="cf-logo-crown-3" d="M110 29L124 43H110V29Z" fill="#D9541E" />
      <path
        className="cf-logo-anvil-orange"
        d="M72 47H124L114 59H88C88 73 88 85 88 96H72C72 82 76 70 76 59H72V47Z"
        fill="#D9541E"
      />
      <path className="cf-logo-anvil-ink" d="M92 63H112C103 70 103 82 116 90V96H92V63Z" fill="currentColor" />
    </svg>
  );

  if (variant === "mark" || isWatermark) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 text-[#111111] dark:text-[#F3EEE3] ${
          isWatermark ? "opacity-[0.05] pointer-events-none select-none" : ""
        } ${className}`}
      >
        {svgMark}
      </span>
    );
  }

  if (variant === "full" || isAnimated) {
    return (
      <span className={`inline-flex flex-col items-center text-center select-none text-[#111111] dark:text-[#F3EEE3] ${className}`}>
        {svgMark}
        <span dir="ltr" className="mt-2 text-xl sm:text-2xl font-black tracking-tight leading-none">
          <span>Commerce</span>
          <span className="text-[#D9541E]">Forge</span>
        </span>
        {showArabicSubtitle && (
          <span dir="rtl" className="mt-1.5 text-xs sm:text-sm font-bold opacity-85 leading-tight">
            مصنع المتاجر الإلكترونية
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 select-none text-[#111111] dark:text-[#F3EEE3] ${className}`}>
      {svgMark}
      <span className="flex flex-col leading-none">
        <span dir="ltr" className="text-base sm:text-lg font-black tracking-tight">
          <span>Commerce</span>
          <span className="text-[#D9541E]">Forge</span>
        </span>
        {showArabicSubtitle && (
          <span dir="rtl" className="mt-1 text-[10px] sm:text-[11px] font-bold opacity-75">
            مصنع المتاجر الإلكترونية
          </span>
        )}
      </span>
    </span>
  );
}
