"use client";

import { useCallback, useEffect, useState } from "react";
import type { MockLocale } from "@/mock/types";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

function isNotificationItem(value: unknown): value is NotificationItem {
  return Boolean(
    value
    && typeof value === "object"
    && "id" in value
    && typeof value.id === "number"
    && "type" in value
    && typeof value.type === "string"
    && "title" in value
    && typeof value.title === "string"
    && "body" in value
    && typeof value.body === "string"
    && "created_at" in value
    && typeof value.created_at === "string"
    && "read" in value
    && typeof value.read === "boolean"
  );
}

export function useNotifications(locale: MockLocale) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?lang=${locale}`, { cache: "no-store" });
      if (!response.ok) {
        setError(true);
        return;
      }

      const payload: unknown = await response.json();
      if (
        !payload
        || typeof payload !== "object"
        || !("data" in payload)
        || !Array.isArray(payload.data)
        || !payload.data.every(isNotificationItem)
        || !("unread_count" in payload)
        || typeof payload.unread_count !== "number"
      ) {
        setError(true);
        return;
      }

      setItems(payload.data);
      setUnreadCount(payload.unread_count);
      setError(false);
    } catch (requestError) {
      if (requestError instanceof TypeError || requestError instanceof SyntaxError) {
        setError(true);
        return;
      }
      throw requestError;
    }
  }, [locale]);

  useEffect(() => {
    void Promise.resolve().then(load);
    const interval = window.setInterval(() => void load(), 30_000);
    window.addEventListener("focus", load);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  const markRead = useCallback(async (id: number) => {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      setError(true);
      return;
    }
    await load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    if (!response.ok) {
      setError(true);
      return;
    }
    await load();
  }, [load]);

  return { items, unreadCount, error, load, markRead, markAllRead };
}
