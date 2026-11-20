"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import type { MockLocale } from "@/mock/types";
import { MARKET_CONFIG } from "@/config/pricing.config";
import { useMarket } from "@/components/landing/MarketSwitcher";
import { FirebaseError, initializeFirebase } from "@/lib/firebase";

type LoginFormProps = {
  locale: MockLocale;
  plan: string | null;
  redirectTo: string;
  googleEnabled: boolean;
  backendConfigured: boolean;
  initialMode?: FormMode;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  } | null;
};

type FormMode = "login" | "register";

const copy = {
  ar: {
    name: "الاسم بالكامل",
    whatsapp: "رقم واتساب",
    countryCode: "مفتاح الدولة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    createAccount: "ليس لديك حساب؟ أنشئ حسابًا",
    existingAccount: "لديك حساب؟ سجّل الدخول",
    google: "تسجيل الدخول بحساب جوجل",
    firebase: "المتابعة باستخدام Google",
    continueWhatsapp: "متابعة",
    whatsappRequired: "أدخل رقم واتساب لإكمال إنشاء حسابك.",
    googleUnavailable: "تسجيل جوجل غير مهيأ بعد",
    pending: "جارٍ التحقق...",
    timeout: "انتهت مهلة الاتصال. حاول مرة أخرى.",
    twoFactor: "رمز التحقق بخطوتين",
    popupClosed: "تم إلغاء نافذة تسجيل الدخول",
    unauthorizedDomain: "يرجى التأكد من تفعيل Google Sign-In وإضافة الدومين في Firebase",
    error: "تعذر تسجيل الدخول. تحقق من البيانات واتصال الخادم.",
  },
  en: {
    name: "Full name",
    whatsapp: "WhatsApp number",
    countryCode: "Country code",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    login: "Sign in",
    register: "Create account",
    createAccount: "New here? Create an account",
    existingAccount: "Already registered? Sign in",
    google: "Continue with Google",
    firebase: "Continue with Google",
    continueWhatsapp: "Continue",
    whatsappRequired: "Enter your WhatsApp number to finish creating your account.",
    googleUnavailable: "Google sign-in is not configured yet",
    pending: "Checking...",
    timeout: "The sign-in request timed out. Please try again.",
    twoFactor: "Two-factor authentication code",
    popupClosed: "The sign-in window was cancelled.",
    unauthorizedDomain: "Enable Google Sign-In and add this domain in Firebase.",
    error: "Sign-in failed. Check your details and the server connection.",
  },
} satisfies Record<MockLocale, Record<string, string>>;

function responseMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (record.errors && typeof record.errors === "object") {
    const firstError = Object.values(record.errors).flat().find((item) => typeof item === "string");
    if (typeof firstError === "string") return firstError;
  }

  return fallback;
}

export function LoginForm({
  locale,
  plan,
  redirectTo,
  googleEnabled,
  backendConfigured,
  firebaseConfig,
  initialMode = "login",
}: LoginFormProps) {
  const router = useRouter();
const mode = initialMode;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [market, setMarket] = useMarket();
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);
  const [firebaseWhatsappRequired, setFirebaseWhatsappRequired] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const text = copy[locale];
  const normalizedPhone = whatsappPhone.replace(/\D/g, "").replace(/^0/, "");
  const internationalPhone = `${MARKET_CONFIG[market].dialCode}${normalizedPhone}`;

  function getGoogleRegistrationUrl(): string | null {
    setError("");
    if (mode !== "register") return "/api/auth/google?mode=login";
    if (!whatsappPhone || normalizedPhone.length < (market === "EG" ? 10 : 9)) {
      setError(locale === "ar" ? "أدخل رقم واتساب صحيحاً أولاً." : "Enter a valid WhatsApp number first.");
      return null;
    }

    return `/api/auth/google?${new URLSearchParams({
      mode: "register",
      whatsapp_phone: internationalPhone,
      market,
    }).toString()}`;
  }

  async function signInWithFirebase() {
    if (!firebaseConfig) return;
    if (firebaseWhatsappRequired && (!whatsappPhone || normalizedPhone.length < (market === "EG" ? 10 : 9))) {
      setError(locale === "ar" ? "أدخل رقم واتساب صحيحاً." : "Enter a valid WhatsApp number.");
      return;
    }
    if (whatsappPhone && normalizedPhone.length < (market === "EG" ? 10 : 9)) {
      setError(locale === "ar" ? "أدخل رقم واتساب صحيحاً." : "Enter a valid WhatsApp number.");
      return;
    }

    setError("");
    setPending(true);
    try {
      let idToken = firebaseIdToken;
      if (!idToken) {
        const { auth, googleProvider } = initializeFirebase(firebaseConfig);
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken(true);
        setFirebaseIdToken(idToken);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      let response: Response;
      let payload: unknown;
      try {
        response = await fetch("/api/auth/firebase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            ...(whatsappPhone ? { whatsapp_phone: internationalPhone, market } : {}),
            ...(twoFactorCode ? { two_factor_code: twoFactorCode } : {}),
          }),
          signal: controller.signal,
        });
        payload = await response.json();
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        if (
          payload
          && typeof payload === "object"
          && "two_factor_required" in payload
          && payload.two_factor_required === true
        ) {
          setTwoFactorRequired(true);
        }
        if (
          payload
          && typeof payload === "object"
          && "whatsapp_required" in payload
          && payload.whatsapp_required === true
        ) {
          setFirebaseWhatsappRequired(true);
          setError(responseMessage(payload, text.whatsappRequired));
          return;
        }
        const reason = responseMessage(payload, text.error);
        setError(
          process.env.NODE_ENV === "development"
            ? `HTTP ${response.status}: ${reason}`
            : reason,
        );
        return;
      }

      const requestedDestination = payload
        && typeof payload === "object"
        && "redirectTo" in payload
        && typeof payload.redirectTo === "string"
        ? payload.redirectTo
        : "/launch";
      const destination = ["/manager", "/dashboard/my-store", "/launch"].includes(requestedDestination)
        ? requestedDestination
        : "/launch";
      setFirebaseIdToken(null);
      window.location.assign(destination);
    } catch (caught) {
      if (caught instanceof FirebaseError && caught.code === "auth/popup-closed-by-user") {
        setError(text.popupClosed);
      } else if (caught instanceof FirebaseError && caught.code === "auth/unauthorized-domain") {
        setError(text.unauthorizedDomain);
      } else if (caught instanceof Error && caught.name === "AbortError") {
        setError(text.timeout);
      } else {
        setError(text.error);
      }
    } finally {
      setPending(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    let response: Response;
    let payload: unknown;
    try {
      response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(mode === "register" ? {
            name,
            password_confirmation: passwordConfirmation,
            whatsapp_phone: internationalPhone,
            market,
          } : {}),
          ...(mode === "login" && twoFactorCode ? { two_factor_code: twoFactorCode } : {}),
          email,
          password,
        }),
      });
      payload = await response.json();
    } catch {
      setPending(false);
      setError(text.error);
      return;
    }

    setPending(false);

    if (!response.ok) {
      if (
        mode === "login"
        && payload
        && typeof payload === "object"
        && "two_factor_required" in payload
        && payload.two_factor_required === true
      ) {
        setTwoFactorRequired(true);
        setError(responseMessage(payload, text.error));
        return;
      }

      setError(responseMessage(payload, text.error));
      return;
    }

    const user = (payload as { user?: { role?: string } }).user;
    const requestedIsPrivileged = redirectTo.startsWith("/manager/") || redirectTo.startsWith("/admin/");
    const template = new URLSearchParams(window.location.search).get("template");
    const destination = user?.role === "super_admin"
      ? plan && template
        ? `/manager/${encodeURIComponent(template)}`
        : plan
          ? "/manager/classic"
        : redirectTo
      : requestedIsPrivileged
        ? "/dashboard/my-store"
        : mode === "register" && !(user && "storeSlug" in user && user.storeSlug)
          ? redirectTo.startsWith("/launch") ? redirectTo : `/launch?lang=${locale}`
        : redirectTo;

    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="auth-card">
      {!firebaseWhatsappRequired && (
        <>
          {firebaseConfig ? (
            <button
              className="button-link auth-google-button"
              disabled={pending || !backendConfigured}
              onClick={signInWithFirebase}
              type="button"
            >
              {pending && <span aria-hidden="true" className="auth-spinner" />}
              {pending ? text.pending : text.firebase}
            </button>
          ) : googleEnabled ? (
            <button
              className="button-link auth-google-button"
              onClick={() => {
                const href = getGoogleRegistrationUrl();
                if (href) window.location.assign(href);
              }}
              type="button"
            >
              {text.google}
            </button>
          ) : (
            <button className="button-link auth-google-button" disabled type="button">
              {text.googleUnavailable}
            </button>
          )}
          {(googleEnabled || firebaseConfig) && (
            <div className="auth-divider"><span>{locale === "ar" ? "أو بالبريد الإلكتروني" : "or with email"}</span></div>
          )}
        </>
      )}
      {!backendConfigured && (
        <p className="auth-notice" role="status">
          {locale === "ar" ? "خدمة المنصة غير متصلة. تحقق من إعدادات الاتصال قبل تسجيل الدخول." : "The platform service is not connected. Check the connection settings before signing in."}
        </p>
      )}
      {firebaseWhatsappRequired && (
        <div className="auth-form">
          <label>
            {text.whatsapp}
            <div className="quote-phone-control">
              <select
                aria-label={text.countryCode}
                onChange={(event) => setMarket(event.target.value === "+966" ? "SA" : "EG")}
                value={MARKET_CONFIG[market].dialCode}
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+966">🇸🇦 +966</option>
              </select>
              <input
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={11}
                onChange={(event) => setWhatsappPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
                required
                type="tel"
                value={whatsappPhone}
              />
            </div>
          </label>
          {twoFactorRequired && (
            <label>
              {text.twoFactor}
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                pattern="[0-9]{6}"
                required
                value={twoFactorCode}
              />
            </label>
          )}
          <button className="button-link auth-submit" disabled={pending || !backendConfigured} onClick={signInWithFirebase} type="button">
            {pending && <span aria-hidden="true" className="auth-spinner" />}
            {pending ? text.pending : text.continueWhatsapp}
          </button>
        </div>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {!firebaseWhatsappRequired && <form className="auth-form" onSubmit={submit}>
        {mode === "register" && (
          <label>
            {text.name}
            <input autoComplete="name" disabled={!backendConfigured} minLength={4} onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
        )}
        {mode === "register" && (
          <label>
            {text.whatsapp}
            <div className="quote-phone-control">
              <select
                aria-label={text.countryCode}
                onChange={(event) => setMarket(event.target.value === "+966" ? "SA" : "EG")}
                value={MARKET_CONFIG[market].dialCode}
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+966">🇸🇦 +966</option>
              </select>
              <input
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={11}
                onChange={(event) => setWhatsappPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
                required
                type="tel"
                value={whatsappPhone}
              />
            </div>
          </label>
        )}
          {mode === "login" && twoFactorRequired && (
            <label>
              {text.twoFactor}
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                pattern="[0-9]{6}"
                required
                value={twoFactorCode}
              />
            </label>
          )}
        <label>
          {text.email}
          <input autoComplete="email" disabled={!backendConfigured} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <label>
          {text.password}
          <input autoComplete={mode === "register" ? "new-password" : "current-password"} disabled={!backendConfigured} minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </label>
        {mode === "register" && (
          <label>
            {text.confirmPassword}
            <input autoComplete="new-password" disabled={!backendConfigured} minLength={8} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} />
          </label>
        )}
        <button className="button-link auth-submit" disabled={pending || !backendConfigured} type="submit">
          {pending ? text.pending : text[mode]}
        </button>
      </form>}
      {!firebaseWhatsappRequired && (
        <button
          className="auth-mode-toggle"
          disabled={!backendConfigured}
          onClick={() => {
            const params = new URLSearchParams({ lang: locale, redirect: redirectTo });
            if (plan) params.set("plan", plan);
            router.push(`${mode === "login" ? "/register" : "/login"}?${params.toString()}`);
          }}
          type="button"
        >
          {mode === "login" ? text.createAccount : text.existingAccount}
        </button>
      )}
    </div>
  );
}
