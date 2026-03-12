import { TICKER_TAPE_DATA } from "@/lib/mockData";

interface HomeTabProps {
  onTickerChange: (ticker: string) => void;
  onTabChange: (tab: any) => void;
}

export default function HomeTab({ onTickerChange, onTabChange }: HomeTabProps) {
  const marketIndices = [
    { name: "S&P 500", ticker: "SPY", price: 692.36, change: 5.02, pct: 0.73 },
    { name: "NASDAQ 100", ticker: "QQQ", price: 615.37, change: 7.54, pct: 1.24 },
    { name: "DOW JONES", ticker: "DIA", price: 440.23, change: 2.15, pct: 0.49 },
    { name: "RUSSELL 2000", ticker: "IWM", price: 224.67, change: 1.89, pct: 0.85 },
  ];

  const topMovers = [
    { symbol: "MSFT", name: "Microsoft", change: 2.49 },
    { symbol: "NVDA", name: "Nvidia", change: 1.99 },
    { symbol: "META", name: "Meta Platforms", change: 1.52 },
    { symbol: "TSLA", name: "Tesla", change: 1.26 },
    { symbol: "AAPL", name: "Apple", change: 0.80 },
  ];

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
            {marketIndices.map(idx => (
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
                  <span className="text-terminal-white">{idx.price.toFixed(2)}</span>
                  <span className={idx.change >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                    {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.pct.toFixed(2)}%)
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
                  <span className="text-terminal-dim ml-2">{m.name}</span>
                </div>
                <span className={m.change >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                  {m.change >= 0 ? "+" : ""}{m.change.toFixed(2)}%
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
