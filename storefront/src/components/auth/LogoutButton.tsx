"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MockLocale } from "@/mock/types";

export function LogoutButton({ label, locale = "ar" }: { label: string; locale?: MockLocale }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setError("");
    setPending(true);
    let response: Response;
    try {
      response = await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      setPending(false);
      setError(locale === "ar" ? "تعذر تسجيل الخروج من الخادم." : "Could not end the server session.");
      return;
    }
    if (!response.ok) {
      setPending(false);
      setError(locale === "ar" ? "تعذر تسجيل الخروج من الخادم." : "Could not end the server session.");
      return;
    }

    router.replace(`/?lang=${locale}`);
    router.refresh();
  }

  return (
    <>
      <button className="auth-logout" disabled={pending} onClick={logout} type="button">
        {pending ? "…" : label}
      </button>
      {error && <span className="auth-inline-error" role="alert">{error}</span>}
    </>
  );
}
