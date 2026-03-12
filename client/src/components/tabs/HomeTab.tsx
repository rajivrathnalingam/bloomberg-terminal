import { useState, useEffect } from "react";

interface HomeTabProps {
  onTickerChange: (ticker: string) => void;
  onTabChange: (tab: any) => void;
}

interface TapeItem {
  symbol: string;
  price: number;
  change: number;
  pct: number;
}

export default function HomeTab({ onTickerChange, onTabChange }: HomeTabProps) {
  const [tapeData, setTapeData] = useState<TapeItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTape() {
      try {
        const res = await fetch("/api/ticker-tape");
        if (res.ok && !cancelled) {
          const items = await res.json();
          if (items.length > 0) setTapeData(items);
        }
      } catch { /* use empty */ }
    }
    fetchTape();
    return () => { cancelled = true; };
  }, []);

  const marketIndices = tapeData.filter(t => ["SPY", "QQQ"].includes(t.symbol));
  const indexDisplay = [
    { name: "S&P 500", ticker: "SPY", ...findTicker("SPY") },
    { name: "NASDAQ 100", ticker: "QQQ", ...findTicker("QQQ") },
    { name: "DOW JONES", ticker: "DIA", price: 0, change: 0, pct: 0 },
    { name: "RUSSELL 2000", ticker: "IWM", price: 0, change: 0, pct: 0 },
  ];

  function findTicker(sym: string): { price: number; change: number; pct: number } {
    const found = tapeData.find(t => t.symbol === sym);
    return found ? { price: found.price, change: found.change, pct: found.pct } : { price: 0, change: 0, pct: 0 };
  }

  // Top movers from tape data, sorted by absolute change
  const topMovers = tapeData
    .filter(t => !["SPY", "QQQ"].includes(t.symbol))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 5);

  const watchlist = ["NVDA", "AAPL", "MSFT", "GOOGL", "META", "AMZN", "TSLA", "AMD", "AVGO", "CRM"];

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: "contain" }}>
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="text-terminal-orange text-lg font-bold mb-1">PERPLEXITY TERMINAL</div>
        <div className="text-terminal-dim text-xs">Financial Analytics Platform — Real-time market data and analysis</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Market Overview */}
        <div>
          <div className="section-header mb-2">Market Overview</div>
          <div className="space-y-1">
            {indexDisplay.map(idx => (
              <div
                key={idx.ticker}
                className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                onClick={() => { onTickerChange(idx.ticker); onTabChange("overview"); }}
              >
                <div>
                  <span className="text-terminal-white font-bold">{idx.name}</span>
                  <span className="text-terminal-dim ml-2">{idx.ticker}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-terminal-white">{idx.price > 0 ? idx.price.toFixed(2) : "—"}</span>
                  <span className={idx.change >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                    {idx.price > 0 ? `${idx.change >= 0 ? "+" : ""}${idx.change.toFixed(2)} (${idx.pct.toFixed(2)}%)` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div>
          <div className="section-header mb-2">Top Movers Today</div>
          <div className="space-y-1">
            {topMovers.map(m => (
              <div
                key={m.symbol}
                className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                onClick={() => { onTickerChange(m.symbol); onTabChange("overview"); }}
              >
                <div>
                  <span className="text-terminal-orange font-bold">{m.symbol}</span>
                </div>
                <span className={m.pct >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                  {m.pct >= 0 ? "+" : ""}{m.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Watchlist */}
      <div className="mt-6">
        <div className="section-header mb-2">Quick Access</div>
        <div className="flex flex-wrap gap-2">
          {watchlist.map(t => (
            <button
              key={t}
              data-testid={`home-ticker-${t}`}
              onClick={() => { onTickerChange(t); onTabChange("overview"); }}
              className="px-3 py-1.5 text-xs border border-[#333330] text-terminal-orange hover:bg-[rgba(255,255,255,0.05)] hover:border-[#555550] cursor-pointer transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Guide */}
      <div className="mt-6">
        <div className="section-header mb-2">Navigation</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { key: "0", label: "HOME", desc: "Market dashboard" },
            { key: "1", label: "OVERVIEW", desc: "Company snapshot" },
            { key: "2", label: "ANALYSIS", desc: "Financial analysis" },
            { key: "3", label: "REL INDEX", desc: "Beta & correlation" },
            { key: "4", label: "REL VALUE", desc: "Peer comparison" },
            { key: "5", label: "NEWS", desc: "Company news feed" },
            { key: "6", label: "OWNERSHIP", desc: "Holders & debt" },
          ].map(nav => (
            <div key={nav.key} className="flex items-center gap-2 py-1 px-2 hover:bg-[rgba(255,255,255,0.02)]">
              <span className="text-terminal-yellow font-bold w-4">[{nav.key}]</span>
              <span className="text-terminal-white">{nav.label}</span>
              <span className="text-terminal-dim">— {nav.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
