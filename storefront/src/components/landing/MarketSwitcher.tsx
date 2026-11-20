"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_MARKET, type MarketId, MARKET_CONFIG } from "@/config/pricing.config";
import type { MockLocale } from "@/mock/types";

const STORAGE_KEY = "cf_market";
const CHANGE_EVENT = "commerceforge:market-change";

export function useMarket(): [MarketId, (market: MarketId) => void] {
  const market = useSyncExternalStore(subscribeToMarket, getMarketSnapshot, () => DEFAULT_MARKET);
  const setMarket = useCallback((nextMarket: MarketId) => {
    window.localStorage.setItem(STORAGE_KEY, nextMarket);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: nextMarket }));
  }, []);

  return [market, setMarket];
}

function getMarketSnapshot(): MarketId {
  const storedMarket = window.localStorage.getItem(STORAGE_KEY);
  return storedMarket === "SA" ? "SA" : DEFAULT_MARKET;
}

function subscribeToMarket(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function MarketSwitcher({ locale }: { locale: MockLocale }) {
  const [market, setMarket] = useMarket();

  return (
    <div aria-label={locale === "ar" ? "اختر السوق والعملة" : "Choose market and currency"} className="market-switcher" role="group">
      {(["EG", "SA"] as const).map((marketId) => (
        <button
          aria-pressed={market === marketId}
          key={marketId}
          onClick={() => setMarket(marketId)}
          type="button"
        >
          {MARKET_CONFIG[marketId].label[locale]} ({MARKET_CONFIG[marketId].symbol})
        </button>
      ))}
    </div>
  );
}
