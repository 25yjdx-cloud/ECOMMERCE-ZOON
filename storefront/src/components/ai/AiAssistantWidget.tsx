"use client";

import Link from "next/link";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { MockLocale } from "@/mock/types";

type Recommendation = {
  answer: string;
  template: string;
  template_name: string;
  color: string;
  domain_tip: string;
  pricing: string;
  preview_url: string;
};
type ChatMessage = { id: number; role: "assistant" | "user"; text: string; recommendation?: Recommendation };

const quickPrompts = {
  ar: [
    "رشّح لي أنسب قالب لمتجري",
    "إيه الفرق بين باقات الاشتراك والتنفيذ الخاص؟",
    "تواصل مع المطور",
  ],
  en: [
    "Recommend the best template for my store",
    "Compare subscriptions and turnkey packages",
    "Contact the developer",
  ],
} satisfies Record<MockLocale, string[]>;

const businessTypes = {
  ar: [
    ["fashion", "ملابس وأزياء"],
    ["sports", "رياضة وجيم"],
    ["furniture", "أثاث وديكور"],
    ["general", "هدايا ومنتجات عامة"],
    ["local-brand", "لوكال براند"],
  ],
  en: [
    ["fashion", "Fashion"],
    ["sports", "Sports & gym"],
    ["furniture", "Furniture & decor"],
    ["general", "Gifts & general products"],
    ["local-brand", "Local brand"],
  ],
} satisfies Record<MockLocale, [string, string][]>;

const labels = {
  ar: {
    trigger: "المساعد الذكي",
    title: "مساعد CommerceForge الذكي",
    intro: "أخبرني بنوع نشاطك لأقترح قالباً وباقة بداية.",
    input: "اكتب سؤالك أو اختر اقتراحاً سريعاً",
    send: "إرسال",
    preview: "معاينة القالب الآن ←",
    whatsapp: "تواصل مع فريق التنفيذ",
    close: "إغلاق المساعد",
    error: "تعذر الاتصال بالمساعد حالياً. حاول مجدداً.",
  },
  en: {
    trigger: "AI advisor",
    title: "CommerceForge AI advisor",
    intro: "Choose your business type for a template and launch recommendation.",
    input: "Ask a question or choose a quick prompt",
    send: "Send",
    preview: "Preview this template →",
    whatsapp: "Contact implementation team",
    close: "Close assistant",
    error: "The advisor is unavailable right now. Try again.",
  },
} satisfies Record<MockLocale, Record<string, string>>;

export function AiAssistantWidget() {
  const [locale, setLocale] = useState<MockLocale>("ar");
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const text = labels[locale];

  useEffect(() => {
    const syncLocale = () => setLocale(document.documentElement.lang === "en" ? "en" : "ar");
    syncLocale();
    window.addEventListener("commerceforge:locale-change", syncLocale);
    const openAssistant = () => setOpen(true);
    window.addEventListener("commerceforge:open-ai", openAssistant);
    return () => {
      window.removeEventListener("commerceforge:locale-change", syncLocale);
      window.removeEventListener("commerceforge:open-ai", openAssistant);
    };
  }, []);

  async function ask(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || pending) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: trimmed }]);
    setQuestion("");
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, locale }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("data" in result)) {
        setError(text.error);
        return;
      }
      const recommendation = result.data as Recommendation;
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: "assistant",
        text: recommendation.answer,
        recommendation,
      }]);
    } catch (requestError) {
      if (!(requestError instanceof TypeError) && !(requestError instanceof SyntaxError)) throw requestError;
      setError(text.error);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={text.trigger}
        className={`ai-assistant-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        title={text.trigger}
        type="button"
      >
        <Sparkles aria-hidden="true" size={19} />
      </button>
      {open && (
        <aside aria-label={text.title} className="ai-assistant-drawer" dir={locale === "ar" ? "rtl" : "ltr"}>
          <header>
            <span className="ai-assistant-mark"><Bot aria-hidden="true" size={20} /></span>
            <strong>{text.title}</strong>
            <button aria-label={text.close} className="utility-icon-button" onClick={() => setOpen(false)} type="button">
              <X aria-hidden="true" size={18} />
            </button>
          </header>
          <div className="ai-assistant-messages" aria-live="polite">
            <p className="ai-assistant-message assistant-message">{text.intro}</p>
            {messages.map((message) => (
              <div className={`ai-message-group ${message.role}`} key={message.id}>
                <p className={`ai-assistant-message ${message.role === "assistant" ? "assistant-message" : "user-message"}`}>
                  {message.text}
                </p>
                {message.recommendation && (
                  <div className="ai-recommendation-card">
                    <strong>{message.recommendation.template_name}</strong>
                    <span>{message.recommendation.color}</span>
                    <span>{message.recommendation.domain_tip}</span>
                    <span>{message.recommendation.pricing}</span>
                    <Link className="button-link" href={`${message.recommendation.preview_url}?lang=${locale}`}>
                      {text.preview}
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </div>
          <div className="ai-quick-prompts">
            {quickPrompts[locale].map((prompt) => (
              <button key={prompt} disabled={pending} onClick={() => void ask(prompt)} type="button">{prompt}</button>
            ))}
            {businessTypes[locale].map(([type, label]) => (
              <button key={type} disabled={pending} onClick={() => void ask(`business_type:${type}`)} type="button">
                {label}
              </button>
            ))}
          </div>
          <form className="ai-assistant-form" onSubmit={submit}>
            <input onChange={(event) => setQuestion(event.target.value)} placeholder={text.input} value={question} />
            <button aria-label={text.send} className="button-link" disabled={pending || !question.trim()} type="submit">
              {pending ? <MessageCircle aria-hidden="true" size={18} /> : <Send aria-hidden="true" size={18} />}
            </button>
          </form>
          <a className="ai-assistant-whatsapp" href="https://wa.me/201145335168" rel="noreferrer" target="_blank">
            {text.whatsapp}
          </a>
        </aside>
      )}
    </>
  );
}
