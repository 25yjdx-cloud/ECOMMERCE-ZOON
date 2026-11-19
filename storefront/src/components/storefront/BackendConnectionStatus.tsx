"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

type Status = "checking" | "connected" | "offline";

export function BackendConnectionStatus({ dictionary }: { dictionary: Dictionary }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;

    async function checkConnection() {
      try {
        const response = await fetch("/api/backend-status", { cache: "no-store" });
        const result: unknown = await response.json();
        const connected =
          response.ok
          && result !== null
          && typeof result === "object"
          && "connected" in result
          && result.connected === true;

        if (active) setStatus(connected ? "connected" : "offline");
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        if (active) setStatus("offline");
      }
    }

    void checkConnection();
    const interval = window.setInterval(checkConnection, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const label = {
    checking: dictionary.navigation.backendChecking,
    connected: dictionary.navigation.backendConnected,
    offline: dictionary.navigation.backendOffline,
  } satisfies Record<Status, string>;

  return (
    <span aria-live="polite" className={`connection-status connection-${status}`} role="status">
      {label[status]}
    </span>
  );
}
