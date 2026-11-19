"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { MockLocale } from "@/mock/types";

type LoginFormProps = {
  locale: MockLocale;
  plan: string | null;
  redirectTo: string;
  googleEnabled: boolean;
  backendConfigured: boolean;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
  } | null;
};

type FormMode = "login" | "register";

const copy = {
  ar: {
    name: "الاسم بالكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    createAccount: "ليس لديك حساب؟ أنشئ حسابًا",
    existingAccount: "لديك حساب؟ سجّل الدخول",
    google: "تسجيل الدخول بحساب جوجل",
    firebase: "المتابعة باستخدام Google عبر Firebase",
    googleUnavailable: "تسجيل جوجل غير مهيأ بعد",
    pending: "جارٍ التحقق...",
    error: "تعذر تسجيل الدخول. تحقق من البيانات واتصال الخادم.",
  },
  en: {
    name: "Full name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    login: "Sign in",
    register: "Create account",
    createAccount: "New here? Create an account",
    existingAccount: "Already registered? Sign in",
    google: "Continue with Google",
    firebase: "Continue with Google using Firebase",
    googleUnavailable: "Google sign-in is not configured yet",
    pending: "Checking...",
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

export function LoginForm({ locale, plan, redirectTo, googleEnabled, backendConfigured, firebaseConfig }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const text = copy[locale];

  async function signInWithFirebase() {
    if (!firebaseConfig) return;

    setError("");
    setPending(true);
    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const credential = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/firebase-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(responseMessage(payload, text.error));
        return;
      }

      const user = (payload as { user?: { role?: string; storeSlug?: string | null } }).user;
      router.replace(
        user?.role === "super_admin" || (user?.role === "merchant" && !user.storeSlug)
          ? redirectTo
          : "/dashboard/my-store",
      );
      router.refresh();
    } catch {
      setError(text.error);
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
          ...(mode === "register" ? { name, password_confirmation: passwordConfirmation } : {}),
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
        : redirectTo;

    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="auth-card">
      {firebaseConfig ? (
        <button className="button-link auth-google-button" disabled={pending} onClick={signInWithFirebase} type="button">
          {pending ? text.pending : text.firebase}
        </button>
      ) : googleEnabled ? (
        <a className="button-link auth-google-button" href="/api/auth/google">
          {text.google}
        </a>
      ) : (
        <button className="button-link auth-google-button" disabled type="button">
          {text.googleUnavailable}
        </button>
      )}
      {(googleEnabled || firebaseConfig) && (
        <div className="auth-divider"><span>{locale === "ar" ? "أو بالبريد الإلكتروني" : "or with email"}</span></div>
      )}
      {!backendConfigured && (
        <p className="auth-notice" role="status">
          {locale === "ar" ? "خدمة Bagisto غير متصلة. أعد إعداد BAGISTO_API_URL قبل تسجيل الدخول." : "Bagisto is not connected. Configure BAGISTO_API_URL before signing in."}
        </p>
      )}
      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && (
          <label>
            {text.name}
            <input autoComplete="name" disabled={!backendConfigured} minLength={4} onChange={(event) => setName(event.target.value)} required value={name} />
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
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button-link auth-submit" disabled={pending || !backendConfigured} type="submit">
          {pending ? text.pending : text[mode]}
        </button>
      </form>
      <button
        className="auth-mode-toggle"
        disabled={!backendConfigured}
        onClick={() => {
          setMode((current) => current === "login" ? "register" : "login");
          setError("");
        }}
        type="button"
      >
        {mode === "login" ? text.createAccount : text.existingAccount}
      </button>
    </div>
  );
}
