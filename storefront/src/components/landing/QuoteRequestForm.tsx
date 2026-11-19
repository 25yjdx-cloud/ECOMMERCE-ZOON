"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";

export function QuoteRequestForm({
  content,
  locale,
}: {
  content: Dictionary["quote"];
  locale: MockLocale;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, package_id: packageId || null, message }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json();
        const messageValue =
          payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
            ? payload.message
            : content.error;
        setError(messageValue);
        return;
      }

      setName("");
      setPhone("");
      setEmail("");
      setPackageId("");
      setMessage("");
      setSuccess(true);
    } catch {
      setError(content.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="quote-panel">
      <div className="quote-packages">
        {content.packages.map((item) => (
          <button
            aria-pressed={packageId === item.id}
            className="quote-package"
            key={item.id}
            onClick={() => setPackageId(item.id)}
            type="button"
          >
            <strong>{item.name}</strong>
            <span>{item.price}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </div>
      <form className="quote-form" onSubmit={submit}>
        <label>{content.name}<input autoComplete="name" minLength={4} onChange={(event) => setName(event.target.value)} required value={name} /></label>
        <label>{content.phone}<input autoComplete="tel-national" dir="ltr" inputMode="numeric" maxLength={11} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} required type="tel" value={phone} /></label>
        <label>{content.email}<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="quote-message">{content.message}<textarea maxLength={2000} onChange={(event) => setMessage(event.target.value)} rows={3} value={message} /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {success && <p className="auth-notice" role="status">{content.success}</p>}
        <button className="button-link" disabled={submitting} type="submit">{submitting ? content.sending : content.submit}</button>
      </form>
      <div className="quote-contact-links">
        <a className="button-link secondary" href="https://wa.me/201145335168" rel="noreferrer" target="_blank">{content.whatsapp}</a>
        <a className="button-link secondary" href="tel:+201145335168">{content.call}</a>
      </div>
      <p className="quote-disclaimer">{content.disclaimer}</p>
    </div>
  );
}
