import { useState, useEffect } from "react";
import { TICKER_TAPE_DATA } from "@/lib/mockData";

interface TapeItem {
  symbol: string;
  price: number;
  change: number;
  pct: number;
}

export default function TickerTape() {
  const [data, setData] = useState<TapeItem[]>(TICKER_TAPE_DATA);

  useEffect(() => {
    let cancelled = false;
    async function fetchTape() {
      try {
        const res = await fetch("/api/ticker-tape");
        if (res.ok && !cancelled) {
          const items = await res.json();
          if (items.length > 0) setData(items);
        }
      } catch {
        // Keep mock data on error
      }
    }
    fetchTape();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTape, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const items = [...data, ...data]; // Double for seamless loop

  return (
    <div className="bg-terminal-bg border-t border-[#222220] overflow-hidden h-[22px] flex items-center">
      <div className="ticker-tape flex items-center gap-6 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={`${item.symbol}-${i}`} className="flex items-center gap-1 text-[11px]">
            <span className="text-terminal-white font-bold">{item.symbol}</span>
            <span className="text-terminal-white">{item.price.toFixed(2)}</span>
            <span className={item.change >= 0 ? "text-terminal-green" : "text-terminal-red"}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.change >= 0 ? "+" : ""}{item.pct.toFixed(2)}%)
            </span>
            <span className="text-terminal-dim mx-2">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
