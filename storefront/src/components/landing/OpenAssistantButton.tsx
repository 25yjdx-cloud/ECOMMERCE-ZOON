"use client";

export function OpenAssistantButton({ children }: { children: string }) {
  return (
    <button
      className="text-button"
      onClick={() => window.dispatchEvent(new Event("commerceforge:open-ai"))}
      type="button"
    >
      {children}
    </button>
  );
}
