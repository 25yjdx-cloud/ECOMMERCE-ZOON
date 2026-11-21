"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function zoneFor(path: string): "marketing" | "merchant_dashboard" | "storefront" | "other" {
  if (path.startsWith("/dashboard")) return "merchant_dashboard";
  if (path.startsWith("/s/")) return "storefront";
  if (["/", "/login", "/register", "/pricing", "/templates", "/gallery"].includes(path)) return "marketing";
  return "other";
}

export function PlatformTelemetry() {
  const pathname = usePathname();

  useEffect(() => {
    let sessionId = window.localStorage.getItem("cf-telemetry-session");
    if (!sessionId) {
      sessionId = window.crypto.randomUUID();
      window.localStorage.setItem("cf-telemetry-session", sessionId);
    }
    const zone = zoneFor(pathname);
    let active = true;
    const beat = () => {
      if (!active) return;
      void fetch("/api/telemetry/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, zone }),
        keepalive: true,
      }).catch(() => undefined);
    };
    beat();
    const timer = window.setInterval(beat, 20_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [pathname]);

  return null;
}
