import { useState, useCallback } from "react";
import type { TabId } from "./types";

// Simple global state for the terminal
let globalTicker = "NVDA";
let globalListeners: Array<() => void> = [];

export function setGlobalTicker(ticker: string) {
  globalTicker = ticker.toUpperCase();
  globalListeners.forEach(fn => fn());
}

export function getGlobalTicker() {
  return globalTicker;
}

export function useTerminalState() {
  const [ticker, setTickerState] = useState(globalTicker);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const setTicker = useCallback((t: string) => {
    const upper = t.toUpperCase().trim();
    if (upper) {
      setGlobalTicker(upper);
      setTickerState(upper);
    }
  }, []);

  return { ticker, setTicker, activeTab, setActiveTab };
}
