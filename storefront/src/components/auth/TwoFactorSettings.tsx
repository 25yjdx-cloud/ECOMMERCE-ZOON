"use client";

import { useState } from "react";

type SetupResponse = { secret?: string; otpauth_url?: string; message?: string };

export function TwoFactorSettings({
  locale,
  enabled,
}: {
  locale: "ar" | "en";
  enabled: boolean;
}) {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(enabled);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const isArabic = locale === "ar";

  async function send(action: "setup" | "verify" | "disable") {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/auth/two-factor/${action}`, {
        method: action === "disable" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        ...(action === "verify" || action === "disable" ? { body: JSON.stringify({ code }) } : {}),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const errorMessage = result && typeof result === "object" && "message" in result && typeof result.message === "string"
          ? result.message
          : isArabic ? "تعذر تحديث إعداد التحقق بخطوتين." : "Could not update two-factor authentication.";
        setMessage(errorMessage);
        return;
      }

      if (action === "setup" && result && typeof result === "object" && "secret" in result) {
        const setup = result as SetupResponse;
        if (typeof setup.secret !== "string") throw new Error("The two-factor setup response is invalid.");
        setSecret(setup.secret);
        setMessage(isArabic
          ? `أضف هذا المفتاح إلى تطبيق المصادقة: ${setup.secret}`
          : `Add this key to your authenticator app: ${setup.secret}`);
      } else {
        const nextEnabled = action === "verify";
        setActive(nextEnabled);
        setSecret("");
        setCode("");
        setMessage(nextEnabled
          ? isArabic ? "تم تفعيل التحقق بخطوتين." : "Two-factor authentication enabled."
          : isArabic ? "تم إيقاف التحقق بخطوتين." : "Two-factor authentication disabled.");
      }
    } catch (error) {
      if (!(error instanceof TypeError) && !(error instanceof SyntaxError)) throw error;
      setMessage(isArabic ? "تعذر الاتصال بالخادم." : "Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="account-theme-card two-factor-settings">
      <div>
        <h2>{isArabic ? "التحقق بخطوتين" : "Two-factor authentication"}</h2>
        <p>{active
          ? isArabic ? "حسابك محمي برمز من تطبيق المصادقة." : "Your account is protected by an authenticator code."
          : isArabic ? "أضف طبقة حماية باستخدام تطبيق TOTP." : "Add another layer of protection with a TOTP authenticator."}</p>
        {secret && <code dir="ltr">{secret}</code>}
        {!active && secret && (
          <label>
            {isArabic ? "رمز التحقق (6 أرقام)" : "Verification code (6 digits)"}
            <input autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value)} value={code} />
          </label>
        )}
        {active && (
          <label>
            {isArabic ? "رمز التطبيق لإيقاف الحماية" : "Authenticator code to disable protection"}
            <input autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value)} value={code} />
          </label>
        )}
        {message && <p role="status">{message}</p>}
      </div>
      {active ? (
        <button className="account-theme-toggle" disabled={pending || !/^\d{6}$/.test(code)} onClick={() => void send("disable")} type="button">
          {isArabic ? "إيقاف 2FA" : "Disable 2FA"}
        </button>
      ) : secret ? (
        <button className="account-theme-toggle" disabled={pending || !/^\d{6}$/.test(code)} onClick={() => void send("verify")} type="button">
          {isArabic ? "تأكيد التفعيل" : "Confirm setup"}
        </button>
      ) : (
        <button className="account-theme-toggle" disabled={pending} onClick={() => void send("setup")} type="button">
          {isArabic ? "إعداد 2FA" : "Set up 2FA"}
        </button>
      )}
    </section>
  );
}
