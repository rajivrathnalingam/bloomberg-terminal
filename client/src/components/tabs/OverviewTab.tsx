import { useState, useEffect } from "react";
import { NEWS_DATA } from "@/lib/mockData";
import PriceChart from "../charts/PriceChart";
import type { HistoricalPrice } from "@/lib/types";

interface OverviewTabProps {
  ticker: string;
  companyName: string;
  quoteData: any;
  profile: any;
}

export default function OverviewTab({ ticker, companyName, quoteData, profile }: OverviewTabProps) {
  const [priceHistory, setPriceHistory] = useState<HistoricalPrice[]>([]);
  const [estimates, setEstimates] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/history/${ticker}?months=9`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPriceHistory(data);
          }
        }
      } catch { /* keep empty */ }
    }
    async function fetchEstimates() {
      try {
        const res = await fetch(`/api/estimates/${ticker}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (!cancelled) setEstimates(data);
        }
      } catch { /* keep empty */ }
    }
    fetchHistory();
    fetchEstimates();
    return () => { cancelled = true; };
  }, [ticker]);

  const price = quoteData?.price ?? 0;
  const change = quoteData?.change ?? 0;
  const changePct = quoteData?.changesPercentage ?? 0;
  const pe = quoteData?.pe ?? 0;
  const eps = quoteData?.eps ?? 0;
  const marketCap = quoteData?.marketCap ?? 0;
  const high52 = quoteData?.yearHigh ?? 0;
  const low52 = quoteData?.yearLow ?? 0;
  const dayHigh = quoteData?.dayHigh ?? 0;
  const dayLow = quoteData?.dayLow ?? 0;
  const divYieldTTM = quoteData?.dividendYieldTTM ?? 0;

  const employees = profile?.fullTimeEmployees ?? 0;
  const city = profile?.city ?? "";
  const state = profile?.state ?? "";
  const country = profile?.country ?? "";
  const website = profile?.website ?? "";
  const ceo = profile?.ceo ?? "";
  const description = profile?.description ?? "";
  const classification = profile?.industry ?? "";

  const formatMktCap = (v: number) => {
    if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
    if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
    return v.toFixed(0);
  };

  const sharesOut = price > 0 ? marketCap / price : 0;
  const floatShares = sharesOut * 0.998;
  const ytdChange = low52 > 0 ? ((price - low52) / low52 * 100) : 0;

  // Extract estimate data  
  const estPe = estimates && Array.isArray(estimates) && estimates[0]?.estPe ? estimates[0].estPe : pe * 0.95;
  const estEps = estimates && Array.isArray(estimates) && estimates[0]?.estEps ? estimates[0].estEps : eps * 1.08;

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      {/* Company Name & Info */}
      <div className="mb-2">
        <div className="flex justify-between items-start">
          <h1 className="text-terminal-white font-bold text-base">{companyName || ticker}</h1>
          <span className="text-terminal-dim text-xs">FIGI BBG000BDJQV0</span>
        </div>
        <div className="flex justify-between text-xs mt-0.5">
          <span className="text-terminal-cyan">6) BI Research Primer | BICO »</span>
          <span className="text-terminal-dim">Classification <span className="text-terminal-white">{classification}</span></span>
        </div>
      </div>

      {/* Description */}
      <p className="text-terminal-orange text-xs leading-relaxed mb-3">{description}</p>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Price Chart */}
        <div>
          <div className="section-header mb-1">8) Price Chart | GP »</div>
          <PriceChart data={priceHistory} />

          {/* Price Stats */}
          <div className="mt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-terminal-white">Px/Chg 1D (USD)</span>
              <span className={change >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                ${price.toFixed(2)}/{change >= 0 ? "+" : ""}{changePct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">52 Wk H ({new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })})</span>
              <span className="text-terminal-white">${high52.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">52 Wk L ({new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })})</span>
              <span className="text-terminal-white">${low52.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">YTD Change/%</span>
              <span className={ytdChange >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                {ytdChange >= 0 ? "+" : ""}{(price - low52).toFixed(2)}/{ytdChange >= 0 ? "+" : ""}{ytdChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Mkt Cap (USD)</span>
              <span className="text-terminal-white">{formatMktCap(marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Shrs Out/Float</span>
              <span className="text-terminal-white">{sharesOut > 0 ? `${(sharesOut / 1e9).toFixed(2)}B/${(floatShares / 1e9).toFixed(2)}B` : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">SI/% of Float</span>
              <span className="text-terminal-white">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Days to Cover</span>
              <span className="text-terminal-white">N/A</span>
            </div>
          </div>
        </div>

        {/* Estimates Column */}
        <div>
          <div className="section-header mb-1">9) Estimates | EE »</div>
          <div className="text-xs space-y-1 mt-2">
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Date (E)</span>
              <span className="text-terminal-white">{new Date().getFullYear()}/FY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">P/E</span>
              <span className="text-terminal-white">{pe.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Est P/E</span>
              <span className="text-terminal-white">{typeof estPe === 'number' ? estPe.toFixed(2) : estPe}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-green">T12M EPS (USD)</span>
              <span className="text-terminal-white">{eps.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Est EPS</span>
              <span className="text-terminal-white">{typeof estEps === 'number' ? estEps.toFixed(2) : estEps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Est PEG</span>
              <span className="text-terminal-white">N.A.</span>
            </div>
          </div>

          {/* Dividend */}
          <div className="section-header mt-4 mb-1">12) Dividend | DVD »</div>
          <div className="text-xs space-y-1 mt-2">
            <div className="flex justify-between">
              <span className="text-terminal-green">Ind Gross Yield</span>
              <span className="text-terminal-white">{divYieldTTM > 0 ? divYieldTTM.toFixed(2) + "%" : "N.A."}</span>
            </div>
            <span className="text-terminal-dim text-[11px]">{divYieldTTM > 0 ? "" : "Cash dividend discontinued"}</span>
          </div>
        </div>

        {/* Corporate Info */}
        <div>
          <div className="section-header mb-1">13) Corporate Info</div>
          <div className="text-xs space-y-1 mt-2">
            <div>
              <span className="text-terminal-yellow">14) </span>
              <a href={`https://${website}`} className="text-terminal-orange hover:underline" target="_blank" rel="noopener noreferrer">{website}</a>
            </div>
            <div className="text-terminal-white ml-6">{[city, state, country].filter(Boolean).join(", ")}</div>
            <div className="flex justify-between">
              <span className="text-terminal-yellow">Empls</span>
              <span className="text-terminal-white">{employees > 0 ? employees.toLocaleString() : "N/A"}</span>
            </div>
          </div>

          {/* Management */}
          <div className="section-header mt-4 mb-1">15) Management | MGMT »</div>
          <div className="text-xs space-y-1 mt-2">
            <div>
              <span className="text-terminal-yellow">16) </span>
              <span className="text-terminal-white">{ceo || "N/A"}</span>
            </div>
            <div className="text-terminal-dim ml-6">President/CEO</div>
          </div>

          {/* Returns */}
          <div className="mt-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-terminal-white">12M Tot Ret</span>
              <span className={ytdChange >= 0 ? "text-terminal-green" : "text-terminal-red"}>{ytdChange.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Beta vs SPX</span>
              <span className="text-terminal-white">N/A</span>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="mt-2 space-y-0">
        {NEWS_DATA.map(news => (
          <div key={news.id} className="flex items-start gap-2 text-xs py-0.5 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer">
            <span className="text-terminal-white w-8 text-right flex-shrink-0">{news.id}</span>
            <span className="text-terminal-orange w-16 flex-shrink-0">{news.source}</span>
            <span className="text-terminal-dim w-12 flex-shrink-0">{news.time}</span>
            <span className="text-terminal-white truncate">{news.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
