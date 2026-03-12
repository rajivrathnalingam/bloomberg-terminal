import { useState, useEffect, useCallback } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { Router } from "wouter";
import TerminalHeader from "@/components/TerminalHeader";
import TickerTape from "@/components/TickerTape";
import HomeTab from "@/components/tabs/HomeTab";
import OverviewTab from "@/components/tabs/OverviewTab";
import AnalysisTab from "@/components/tabs/AnalysisTab";
import RelIndexTab from "@/components/tabs/RelIndexTab";
import RelValueTab from "@/components/tabs/RelValueTab";
import NewsTab from "@/components/tabs/NewsTab";
import OwnershipTab from "@/components/tabs/OwnershipTab";
import type { TabId } from "@/lib/types";

const PAGE_TITLES: Record<TabId, string> = {
  home: "Home",
  overview: "Company Overview",
  analysis: "Financial Analysis",
  relindex: "Rel Index",
  relvalue: "Relative Value",
  news: "Company News",
  ownership: "Security Ownership",
};

function Terminal() {
  const [ticker, setTicker] = useState("NVDA");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [companyName, setCompanyName] = useState("NVIDIA CORP");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Set dark class on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Fetch real quote and profile data when ticker changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const [quoteRes, profileRes] = await Promise.all([
          fetch(`/api/quote/${ticker}`),
          fetch(`/api/profile/${ticker}`),
        ]);
        
        if (cancelled) return;

        if (quoteRes.ok) {
          const quote = await quoteRes.json();
          if (!cancelled) setQuoteData(quote);
        }

        if (profileRes.ok) {
          const prof = await profileRes.json();
          if (!cancelled) {
            setProfile(prof);
            setCompanyName(prof.companyName || ticker);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [ticker]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const tabMap: Record<string, TabId> = {
        "0": "home", "1": "overview", "2": "analysis",
        "3": "relindex", "4": "relvalue", "5": "news", "6": "ownership",
      };
      if (tabMap[e.key]) {
        setActiveTab(tabMap[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleTickerChange = useCallback((newTicker: string) => {
    setTicker(newTicker.toUpperCase());
  }, []);

  const headerQuoteData = quoteData ? {
    price: quoteData.price,
    change: quoteData.change,
    bid: quoteData.price - 0.01,
    ask: quoteData.price,
    volume: quoteData.volume,
    open: quoteData.open,
    high: quoteData.dayHigh,
    low: quoteData.dayLow,
    marketCap: quoteData.marketCap >= 1e12
      ? (quoteData.marketCap / 1e12).toFixed(2) + "T"
      : (quoteData.marketCap / 1e9).toFixed(2) + "B",
  } : null;

  return (
    <div className="h-screen flex flex-col bg-terminal-bg overflow-hidden">
      <TerminalHeader
        ticker={ticker}
        onTickerChange={handleTickerChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        quoteData={headerQuoteData}
        companyName={companyName}
        pageTitle={PAGE_TITLES[activeTab]}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "home" && (
          <HomeTab onTickerChange={handleTickerChange} onTabChange={setActiveTab} />
        )}
        {activeTab === "overview" && (
          <OverviewTab ticker={ticker} companyName={companyName} quoteData={quoteData} profile={profile} />
        )}
        {activeTab === "analysis" && (
          <AnalysisTab ticker={ticker} companyName={companyName} />
        )}
        {activeTab === "relindex" && (
          <RelIndexTab ticker={ticker} />
        )}
        {activeTab === "relvalue" && (
          <RelValueTab ticker={ticker} />
        )}
        {activeTab === "news" && (
          <NewsTab ticker={ticker} onTickerChange={handleTickerChange} />
        )}
        {activeTab === "ownership" && (
          <OwnershipTab ticker={ticker} />
        )}
      </div>

      {/* Bottom Ticker Tape */}
      <TickerTape />
    </div>
  );
}

function App() {
  return (
    <Router hook={useHashLocation}>
      <Terminal />
    </Router>
  );
}

export default App;
