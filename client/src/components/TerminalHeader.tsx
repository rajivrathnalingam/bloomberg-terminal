import { useState, useRef, useEffect, useCallback } from "react";
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

interface LookupResult {
  symbol?: string;
  Symbol?: string;
  name?: string;
  Name?: string;
  [key: string]: unknown;
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
  const [suggestions, setSuggestions] = useState<LookupResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(ticker);
  }, [ticker]);

  // Debounced ticker lookup
  const lookupTicker = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ticker-lookup?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data.slice(0, 8));
            setShowSuggestions(true);
            setSelectedIdx(-1);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInputValue(val);
    lookupTicker(val);
  };

  const selectTicker = (symbol: string) => {
    setInputValue(symbol);
    setShowSuggestions(false);
    setSuggestions([]);
    onTickerChange(symbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx >= 0 && suggestions[selectedIdx]) {
      const sym = suggestions[selectedIdx].symbol || suggestions[selectedIdx].Symbol || inputValue;
      selectTicker(String(sym));
    } else if (inputValue.trim()) {
      selectTicker(inputValue.trim().toUpperCase());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
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

      {/* Ticker Input with Autocomplete */}
      <div className="bg-terminal-bg px-3 py-1 border-b border-[#333330] relative">
        <form onSubmit={handleSubmit} className="w-full">
          <input
            ref={inputRef}
            data-testid="ticker-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); }}
            className="terminal-input w-full"
            placeholder="Type any ticker or company name to search..."
          />
        </form>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-50 bg-[#1a1a18] border border-[#333330] max-h-60 overflow-y-auto">
            {suggestions.map((s, idx) => {
              const sym = String(s.symbol || s.Symbol || s.ticker || s.Ticker || "");
              const name = String(s.name || s.Name || s.companyName || "");
              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center gap-3 ${
                    idx === selectedIdx ? "bg-[#0055aa]" : "hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                  onMouseDown={() => selectTicker(sym)}
                >
                  <span className="text-terminal-orange font-bold w-16">{sym}</span>
                  <span className="text-terminal-white truncate">{name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
