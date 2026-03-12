import { useMemo } from "react";
import { generatePriceHistory, NEWS_DATA } from "@/lib/mockData";
import PriceChart from "../charts/PriceChart";

interface OverviewTabProps {
  ticker: string;
  companyName: string;
  quoteData: any;
  profile: any;
}

export default function OverviewTab({ ticker, companyName, quoteData, profile }: OverviewTabProps) {
  const priceHistory = useMemo(() => generatePriceHistory(12), [ticker]);

  const price = quoteData?.price ?? 192.85;
  const change = quoteData?.change ?? 1.36;
  const changePct = quoteData?.changesPercentage ?? 0.71;
  const pe = quoteData?.pe ?? 64.93;
  const eps = quoteData?.eps ?? 2.97;
  const marketCap = quoteData?.marketCap ?? 4.69e12;
  const volume = quoteData?.volume ?? 175123602;
  const high52 = quoteData?.yearHigh ?? 212.19;
  const low52 = quoteData?.yearLow ?? 86.62;
  const open = quoteData?.open ?? 191.49;
  const dayHigh = quoteData?.dayHigh ?? 193.77;
  const dayLow = quoteData?.dayLow ?? 187.40;
  const prevClose = quoteData?.previousClose ?? 191.49;

  const employees = profile?.fullTimeEmployees ?? 36000;
  const city = profile?.city ?? "SANTA CLARA";
  const state = profile?.state ?? "CA";
  const country = profile?.country ?? "US";
  const website = profile?.website ?? "nvidia.com";
  const ceo = profile?.ceo ?? "Jensen Huang";
  const description = profile?.description ?? "Nvidia is a leading developer of graphics processing units. Traditionally, GPUs were used to enhance the experience on computing platforms, most notably in gaming applications on PCs. GPU use cases have since emerged as important semiconductors used in artificial intelligence to run large language models. Nvidia not only offers AI GPUs, but also a software platform, Cuda, used for AI model development and training. Nvidia is also expanding its data center networking solutions, helping to tie GPUs together to handle complex workloads.";
  const classification = profile?.industry ?? "SEMICONDUCTORS & RELATED DEVICES";
  const figi = "BBG000BDJQV0";

  const formatMktCap = (v: number) => {
    if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
    if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
    return v.toFixed(0);
  };

  const sharesOut = marketCap / price;
  const floatShares = sharesOut * 0.998;
  const ytdChange = ((price - low52) / low52 * 100);

  const estPe = 61.69;
  const estEps = 3.21;
  const estPeg = "N.A.";
  const divYield = "N.A.";
  const totRet12m = "52.29%";
  const betaVsSPX = "N/A";

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      {/* Company Name & Info */}
      <div className="mb-2">
        <div className="flex justify-between items-start">
          <h1 className="text-terminal-white font-bold text-base">{companyName || "NVIDIA CORP"}</h1>
          <span className="text-terminal-dim text-xs">FIGI {figi}</span>
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
              <span className="text-terminal-green">+{(price - low52).toFixed(2)}/+{ytdChange.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Mkt Cap (USD)</span>
              <span className="text-terminal-white">{formatMktCap(marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Shrs Out/Float</span>
              <span className="text-terminal-white">{(sharesOut / 1e9).toFixed(2)}B/{(floatShares / 1e9).toFixed(2)}B</span>
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
              <span className="text-terminal-white">2025/FY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">P/E</span>
              <span className="text-terminal-white">{pe.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Est P/E</span>
              <span className="text-terminal-white">{estPe.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-green">T12M EPS (USD)</span>
              <span className="text-terminal-white">{eps.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Est EPS</span>
              <span className="text-terminal-white">{estEps.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-cyan">Est PEG</span>
              <span className="text-terminal-white">{estPeg}</span>
            </div>
          </div>

          {/* Dividend */}
          <div className="section-header mt-4 mb-1">12) Dividend | DVD »</div>
          <div className="text-xs space-y-1 mt-2">
            <div className="flex justify-between">
              <span className="text-terminal-green">Ind Gross Yield</span>
              <span className="text-terminal-white">{divYield}</span>
            </div>
            <span className="text-terminal-dim text-[11px]">Cash dividend discontinued</span>
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
            <div className="text-terminal-white ml-6">{city}, {state}, {country}</div>
            <div className="flex justify-between">
              <span className="text-terminal-yellow">Empls</span>
              <span className="text-terminal-white">{employees.toLocaleString()}</span>
            </div>
          </div>

          {/* Management */}
          <div className="section-header mt-4 mb-1">15) Management | MGMT »</div>
          <div className="text-xs space-y-1 mt-2">
            <div>
              <span className="text-terminal-yellow">16) </span>
              <span className="text-terminal-white">{ceo}</span>
            </div>
            <div className="text-terminal-dim ml-6">President/CEO</div>
            <div>
              <span className="text-terminal-yellow">17) </span>
              <span className="text-terminal-white">Colette Kress</span>
            </div>
            <div className="text-terminal-dim ml-6">CFO</div>
          </div>

          {/* Returns */}
          <div className="mt-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-terminal-white">12M Tot Ret</span>
              <span className="text-terminal-green">{totRet12m}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-white">Beta vs SPX</span>
              <span className="text-terminal-white">{betaVsSPX}</span>
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
