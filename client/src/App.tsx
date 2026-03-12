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

  // Set dark class on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Mock data for initial render
  useEffect(() => {
    const mockQuotes: Record<string, any> = {
      NVDA: { price: 192.85, change: 1.36, changesPercentage: 0.71, marketCap: 4.69e12, pe: 64.93, eps: 2.97, volume: 175123602, avgVolume: 200000000, dayLow: 187.40, dayHigh: 193.77, yearLow: 86.62, yearHigh: 212.19, previousClose: 191.49, open: 191.49, dividendYieldTTM: 0.02 },
      AAPL: { price: 274.34, change: 2.17, changesPercentage: 0.80, marketCap: 4.2e12, pe: 38.5, eps: 7.12, volume: 45000000, avgVolume: 50000000, dayLow: 271.50, dayHigh: 275.80, yearLow: 164.08, yearHigh: 280.00, previousClose: 272.17, open: 273.00, dividendYieldTTM: 0.44 },
      MSFT: { price: 398.74, change: 9.69, changesPercentage: 2.49, marketCap: 2.96e12, pe: 35.2, eps: 11.33, volume: 28000000, avgVolume: 25000000, dayLow: 392.50, dayHigh: 400.20, yearLow: 309.45, yearHigh: 405.00, previousClose: 389.05, open: 391.00, dividendYieldTTM: 0.72 },
      TSLA: { price: 415.17, change: 5.15, changesPercentage: 1.26, marketCap: 1.32e12, pe: 168.5, eps: 2.46, volume: 95000000, avgVolume: 100000000, dayLow: 408.00, dayHigh: 418.50, yearLow: 138.80, yearHigh: 420.00, previousClose: 410.02, open: 411.00, dividendYieldTTM: 0 },
    };

    const mockProfiles: Record<string, any> = {
      NVDA: { companyName: "NVIDIA CORP", industry: "SEMICONDUCTORS & RELATED DEVICES", sector: "Technology", ceo: "Jensen Huang", fullTimeEmployees: 36000, website: "nvidia.com", city: "SANTA CLARA", state: "CA", country: "US", description: "Nvidia is a leading developer of graphics processing units. Traditionally, GPUs were used to enhance the experience on computing platforms, most notably in gaming applications on PCs. GPU use cases have since emerged as important semiconductors used in artificial intelligence to run large language models. Nvidia not only offers AI GPUs, but also a software platform, Cuda, used for AI model development and training. Nvidia is also expanding its data center networking solutions, helping to tie GPUs together to handle complex workloads." },
      AAPL: { companyName: "APPLE INC", industry: "CONSUMER ELECTRONICS", sector: "Technology", ceo: "Tim Cook", fullTimeEmployees: 164000, website: "apple.com", city: "CUPERTINO", state: "CA", country: "US", description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide." },
      MSFT: { companyName: "MICROSOFT CORP", industry: "SOFTWARE - INFRASTRUCTURE", sector: "Technology", ceo: "Satya Nadella", fullTimeEmployees: 228000, website: "microsoft.com", city: "REDMOND", state: "WA", country: "US", description: "Microsoft Corporation develops and supports software, services, devices, and solutions worldwide." },
      TSLA: { companyName: "TESLA INC", industry: "AUTO MANUFACTURERS", sector: "Consumer Cyclical", ceo: "Elon Musk", fullTimeEmployees: 140000, website: "tesla.com", city: "AUSTIN", state: "TX", country: "US", description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems." },
    };

    setQuoteData(mockQuotes[ticker] || mockQuotes.NVDA);
    const profileData = mockProfiles[ticker] || mockProfiles.NVDA;
    setProfile(profileData);
    setCompanyName(profileData.companyName);
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
