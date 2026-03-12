import { useState, useRef, useEffect } from "react";
import type { TabId } from "@/lib/types";

interface TerminalHeaderProps {
  ticker: string;
  onTickerChange: (ticker: string) => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  quoteData: {
    price: number;
    change: number;
    bid: number;
    ask: number;
    volume: number;
    open: number;
    high: number;
    low: number;
    marketCap: string;
  } | null;
  companyName: string;
  pageTitle: string;
}

const TABS: { id: TabId; label: string; key: string }[] = [
  { id: "home", label: "HOME", key: "0" },
  { id: "overview", label: "OVERVIEW", key: "1" },
  { id: "analysis", label: "ANALYSIS", key: "2" },
  { id: "relindex", label: "REL INDEX", key: "3" },
  { id: "relvalue", label: "REL VALUE", key: "4" },
  { id: "news", label: "NEWS", key: "5" },
  { id: "ownership", label: "OWNERSHIP", key: "6" },
];

export default function TerminalHeader({
  ticker,
  onTickerChange,
  activeTab,
  onTabChange,
  quoteData,
  companyName,
  pageTitle,
}: TerminalHeaderProps) {
  const [inputValue, setInputValue] = useState(ticker);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(ticker);
  }, [ticker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onTickerChange(inputValue.trim().toUpperCase());
    }
  };

  const priceColor = quoteData && quoteData.change >= 0 ? "text-terminal-green" : "text-terminal-red";
  const changeSign = quoteData && quoteData.change >= 0 ? "↑" : "↓";

  return (
    <div className="flex-shrink-0">
      {/* Top Red Header Bar */}
      <div className="terminal-header-bar px-3 py-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm tracking-wide">PERPLEXITY TERMINAL</span>
        </div>
        <div className="flex items-center gap-2 text-white text-xs">
          <span>{ticker} US Equity</span>
          <span className="opacity-60">|</span>
          <span>{pageTitle}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-white">Financial Analytics Platform</span>
          <span className="live-indicator inline-block w-2 h-2 rounded-full bg-red-500" />
          <span className="text-terminal-green font-bold">LIVE</span>
        </div>
      </div>

      {/* Quote Bar */}
      <div className="bg-terminal-bg px-3 py-1 flex items-center gap-4 text-xs border-b border-[#222220]">
        <div className="flex items-center gap-2">
          <span className="text-terminal-white font-bold">{ticker} US</span>
          <span className="text-terminal-dim">$</span>
          <span className={`${priceColor} font-bold`}>{changeSign}</span>
          <span className={`${priceColor} font-bold text-lg`}>
            {quoteData?.price?.toFixed(2) ?? "---"}
          </span>
          <span className={priceColor}>
            {quoteData ? `${quoteData.change >= 0 ? "+" : ""}${quoteData.change.toFixed(2)}` : "---"}
          </span>
          {/* Mini sparkline placeholder */}
          <svg width="60" height="16" className="ml-1">
            <polyline
              fill="none"
              stroke={quoteData && quoteData.change >= 0 ? "#00cc00" : "#ff3333"}
              strokeWidth="1.5"
              points="0,12 8,10 16,8 24,11 32,7 40,5 48,8 56,4"
            />
          </svg>
        </div>
        <div className="flex items-center gap-4 text-terminal-dim">
          <span>F{quoteData?.bid?.toFixed(2) ?? "---"} / {quoteData?.ask?.toFixed(2) ?? "---"}</span>
          <span>1x1</span>
        </div>
      </div>

      {/* Detail Quote Bar */}
      <div className="bg-terminal-bg px-3 py-0.5 flex items-center gap-6 text-[11px] border-b border-[#222220]">
        <div className="flex items-center gap-1">
          <span className="text-terminal-dim">⏱</span>
          <span className="text-terminal-dim">At {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} w</span>
        </div>
        <span className="text-terminal-dim">|</span>
        <span className="text-terminal-dim">Vol <span className="text-terminal-white">{quoteData?.volume ? (quoteData.volume / 1e6).toFixed(0) + "M" : "---"}</span></span>
        <span className="text-terminal-dim">O <span className="text-terminal-white">{quoteData?.open?.toFixed(2) ?? "---"}</span></span>
        <span className="text-terminal-dim">H <span className="text-terminal-white">{quoteData?.high?.toFixed(2) ?? "---"}</span></span>
        <span className="text-terminal-dim">L <span className="text-terminal-white">{quoteData?.low?.toFixed(2) ?? "---"}</span></span>
        <span className="text-terminal-dim">Val <span className="text-terminal-white">{quoteData?.marketCap ?? "---"}</span></span>
        <span className="text-terminal-green font-bold ml-auto">OPEN</span>
      </div>

      {/* Tab Navigation */}
      <div className="bg-terminal-bg px-3 py-1 flex items-center gap-1 border-b border-[#222220]">
        <span className="tab-active px-2 py-0.5 text-xs cursor-pointer">{ticker} US Equity</span>
        {TABS.map(tab => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`px-2 py-0.5 text-xs cursor-pointer transition-colors ${
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            }`}
          >
            [{tab.key}] {tab.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-terminal-dim">Press 0-6 to navigate · Type ticker to search</span>
      </div>

      {/* Ticker Input */}
      <div className="bg-terminal-bg px-3 py-1 border-b border-[#333330]">
        <form onSubmit={handleSubmit} className="w-full">
          <input
            ref={inputRef}
            data-testid="ticker-input"
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value.toUpperCase())}
            className="terminal-input w-full"
            placeholder="Type ticker to search..."
          />
        </form>
      </div>
    </div>
  );
}
