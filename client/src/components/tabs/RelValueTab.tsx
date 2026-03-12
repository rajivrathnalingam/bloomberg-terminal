import { useMemo } from "react";
import { PEER_DATA, generateNormalizedPrices } from "@/lib/mockData";

interface RelValueTabProps {
  ticker: string;
}

const PEER_COLORS: Record<string, string> = {
  "NVDA": "#3399ff",
  "AMD": "#ff6666",
  "INTC": "#cc6633",
  "AVGO": "#33cc33",
  "QCOM": "#cc33cc",
  "TXN": "#cc9933",
  "MRVL": "#3399cc",
  "ARM": "#ff3333",
};

export default function RelValueTab({ ticker }: RelValueTabProps) {
  const peers = useMemo(() => PEER_DATA.map(p => p.symbol), []);
  const normalizedPrices = useMemo(() => generateNormalizedPrices(peers), [peers]);

  const medianData = {
    marketCap: "212.00B",
    price: "170.92",
    change1d: "1.50%",
    change1m: "3.91%",
    revGrowth: "13.66%",
    epsGrowth: "5.56%",
    pe: "66.24",
    roe: "26.13%",
    divYield: "0.73%",
  };

  const formatMktCap = (v: number) => {
    if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
    if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
    return v.toFixed(0);
  };

  // Draw normalized chart
  const chartHeight = 200;
  const chartWidth = 800;

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      {/* Time period selector */}
      <div className="flex items-center gap-1 mb-3 justify-end">
        {["3M", "6M"].map(p => (
          <button key={p} className="px-2 py-0.5 text-[10px] text-terminal-dim border border-[#333330] hover:bg-[rgba(255,255,255,0.05)]">{p}</button>
        ))}
        <button className="px-2 py-0.5 text-[10px] bg-terminal-tab-active text-white border border-[#0077cc]">1Y</button>
        {["2Y", "5Y"].map(p => (
          <button key={p} className="px-2 py-0.5 text-[10px] text-terminal-dim border border-[#333330] hover:bg-[rgba(255,255,255,0.05)]">{p}</button>
        ))}
      </div>

      {/* Normalized Price Chart */}
      <div className="price-chart-area mb-3" style={{ height: chartHeight + 40 }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-full">
          {/* Grid */}
          {[50, 100, 150, 200, 250, 300].map(v => {
            const y = chartHeight - ((v - 50) / 250) * chartHeight;
            return (
              <g key={v}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#1a1a18" strokeWidth="0.5" />
                <text x={chartWidth - 30} y={y + 3} fill="#666655" fontSize="8" fontFamily="var(--font-mono)">{v}</text>
              </g>
            );
          })}

          {/* Lines for each peer */}
          {peers.map(symbol => {
            const data = normalizedPrices[symbol];
            if (!data || data.length < 2) return null;

            const points = data.map((d, i) => {
              const x = (i / (data.length - 1)) * (chartWidth - 40);
              const y = chartHeight - ((d.value - 50) / 250) * chartHeight;
              return `${x},${y}`;
            }).join(' ');

            return (
              <polyline
                key={symbol}
                fill="none"
                stroke={PEER_COLORS[symbol] || "#666"}
                strokeWidth={symbol === ticker ? "2" : "1"}
                opacity={symbol === ticker ? 1 : 0.6}
                points={points}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-3 justify-center mt-1">
          {peers.map(symbol => (
            <label key={symbol} className="flex items-center gap-1 text-[10px] cursor-pointer">
              <span className="inline-block w-3 h-3 border" style={{ borderColor: PEER_COLORS[symbol], backgroundColor: symbol === ticker ? PEER_COLORS[symbol] : 'transparent' }} />
              <span className="text-terminal-white">{symbol}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Peer Comparison Table */}
      <div className="text-xs font-bold text-terminal-white mb-2 mt-4">PEER COMPARISON</div>
      <table className="terminal-table">
        <thead>
          <tr>
            <th className="text-left w-8"></th>
            <th className="text-left">Name<br /><span className="font-normal text-terminal-dim">(BI Peers)</span></th>
            <th className="text-right">Mkt Cap<br />(USD)</th>
            <th className="text-right">Last Px<br />(USD)</th>
            <th className="text-right">Chg Pct<br />1D</th>
            <th className="text-right">Chg Pct<br />1M</th>
            <th className="text-right">Rev - 1<br />Yr Gr:Y</th>
            <th className="text-right">EPS - 1<br />Yr Gr:Y</th>
            <th className="text-right">P/E</th>
            <th className="text-right">ROE</th>
            <th className="text-right">Dvd 12M<br />Yld</th>
          </tr>
        </thead>
        <tbody>
          {/* Median Row */}
          <tr className="bg-[rgba(255,255,255,0.04)]">
            <td></td>
            <td className="font-bold text-terminal-white">Median</td>
            <td className="text-right text-terminal-yellow">{medianData.marketCap}</td>
            <td className="text-right text-terminal-yellow">{medianData.price}</td>
            <td className="text-right text-terminal-green">{medianData.change1d}</td>
            <td className="text-right text-terminal-green">{medianData.change1m}</td>
            <td className="text-right text-terminal-green">{medianData.revGrowth}</td>
            <td className="text-right text-terminal-green">{medianData.epsGrowth}</td>
            <td className="text-right text-terminal-yellow">{medianData.pe}</td>
            <td className="text-right text-terminal-yellow">{medianData.roe}</td>
            <td className="text-right text-terminal-yellow">{medianData.divYield}</td>
          </tr>

          {/* Peer rows */}
          {PEER_DATA.map((peer, idx) => (
            <tr key={peer.symbol} className={peer.symbol === ticker ? "highlighted" : ""}>
              <td className="text-terminal-dim">{101 + idx})</td>
              <td className={peer.symbol === ticker ? "text-terminal-orange font-bold" : "text-terminal-orange"}>
                {peer.name}
              </td>
              <td className="text-right text-terminal-white">{formatMktCap(peer.marketCap)}</td>
              <td className="text-right text-terminal-white">{peer.price.toFixed(2)}</td>
              <td className={`text-right ${peer.change1d >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                {peer.change1d.toFixed(2)}%
              </td>
              <td className={`text-right ${peer.change1m >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                {peer.change1m.toFixed(2)}%
              </td>
              <td className={`text-right ${peer.revenueGrowth > 0 ? "text-terminal-green" : peer.revenueGrowth < 0 ? "text-terminal-red" : "text-terminal-dim"}`}>
                {peer.revenueGrowth ? peer.revenueGrowth.toFixed(2) + "%" : "—"}
              </td>
              <td className={`text-right ${peer.epsGrowth > 0 ? "text-terminal-green" : peer.epsGrowth < 0 ? "text-terminal-red" : "text-terminal-dim"}`}>
                {peer.epsGrowth ? peer.epsGrowth.toFixed(2) + "%" : "—"}
              </td>
              <td className="text-right text-terminal-white">{peer.pe > 0 ? peer.pe.toFixed(2) : "—"}</td>
              <td className="text-right text-terminal-white">{peer.roe ? peer.roe.toFixed(2) + "%" : "—"}</td>
              <td className="text-right text-terminal-white">{peer.dividendYield > 0 ? peer.dividendYield.toFixed(2) + "%" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
