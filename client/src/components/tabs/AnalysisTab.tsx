import { useMemo } from "react";

interface AnalysisTabProps {
  ticker: string;
  companyName: string;
}

export default function AnalysisTab({ ticker, companyName }: AnalysisTabProps) {
  // Generate financial data
  const financials = useMemo(() => ({
    revenue: [
      { period: "FY2025", value: 130497 },
      { period: "FY2024", value: 60922 },
      { period: "FY2023", value: 26974 },
      { period: "FY2022", value: 26914 },
    ],
    grossProfit: [
      { period: "FY2025", value: 97862 },
      { period: "FY2024", value: 44803 },
      { period: "FY2023", value: 15356 },
      { period: "FY2022", value: 17475 },
    ],
    netIncome: [
      { period: "FY2025", value: 72880 },
      { period: "FY2024", value: 29760 },
      { period: "FY2023", value: 4368 },
      { period: "FY2022", value: 9752 },
    ],
    operatingMargin: [
      { period: "FY2025", value: 62.3 },
      { period: "FY2024", value: 54.1 },
      { period: "FY2023", value: 20.8 },
      { period: "FY2022", value: 37.3 },
    ],
  }), [ticker]);

  const maxRevenue = Math.max(...financials.revenue.map(r => r.value));
  const barWidth = 500;

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      <div className="mb-4">
        <div className="text-terminal-white font-bold text-sm mb-1">{companyName || ticker} — Financial Analysis</div>
        <div className="text-terminal-dim text-xs">Key metrics and fundamental data overview</div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <div className="section-header mb-2">Revenue (USD Millions)</div>
        <div className="space-y-2">
          {financials.revenue.map(r => (
            <div key={r.period} className="flex items-center gap-3 text-xs">
              <span className="text-terminal-yellow w-16">{r.period}</span>
              <div className="flex-1 h-5 bg-[#111110] relative">
                <div
                  className="h-full bg-[#0055aa]"
                  style={{ width: `${(r.value / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="text-terminal-white w-20 text-right">${(r.value / 1000).toFixed(1)}B</span>
            </div>
          ))}
        </div>
      </div>

      {/* Profitability Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="section-header mb-2">Gross Profit (USD Millions)</div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Period</th>
                <th className="text-right">Value</th>
                <th className="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {financials.grossProfit.map((g, i) => (
                <tr key={g.period}>
                  <td className="text-terminal-yellow">{g.period}</td>
                  <td className="text-right text-terminal-white">${(g.value / 1000).toFixed(1)}B</td>
                  <td className="text-right text-terminal-green">
                    {((g.value / financials.revenue[i].value) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-header mb-2">Net Income (USD Millions)</div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Period</th>
                <th className="text-right">Value</th>
                <th className="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {financials.netIncome.map((n, i) => (
                <tr key={n.period}>
                  <td className="text-terminal-yellow">{n.period}</td>
                  <td className="text-right text-terminal-white">${(n.value / 1000).toFixed(1)}B</td>
                  <td className="text-right text-terminal-green">
                    {((n.value / financials.revenue[i].value) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operating Metrics */}
      <div className="mb-6">
        <div className="section-header mb-2">Operating Margin Trend</div>
        <div className="price-chart-area" style={{ height: 120 }}>
          <svg viewBox="0 0 500 100" className="w-full h-full">
            {financials.operatingMargin.map((m, i) => {
              const x = 60 + i * 120;
              const barH = (m.value / 70) * 80;
              return (
                <g key={m.period}>
                  <rect x={x} y={90 - barH} width={60} height={barH} fill="#0055aa" />
                  <text x={x + 30} y={98} fill="#ccccaa" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">{m.period}</text>
                  <text x={x + 30} y={85 - barH} fill="#00cc00" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">{m.value}%</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Key Ratios */}
      <div className="section-header mb-2">Key Financial Ratios</div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "P/E Ratio", value: "64.93", trend: "up" },
          { label: "EV/EBITDA", value: "48.2", trend: "up" },
          { label: "Price/Sales", value: "36.1", trend: "up" },
          { label: "ROE", value: "91.87%", trend: "up" },
          { label: "Gross Margin", value: "75.0%", trend: "up" },
          { label: "Net Margin", value: "55.8%", trend: "up" },
          { label: "Debt/Equity", value: "12.6%", trend: "down" },
          { label: "FCF Yield", value: "1.2%", trend: "neutral" },
        ].map(ratio => (
          <div key={ratio.label} className="bg-[rgba(255,255,255,0.02)] p-2">
            <div className="text-terminal-dim text-[10px]">{ratio.label}</div>
            <div className="text-terminal-white text-sm font-bold">{ratio.value}</div>
            <div className={`text-[10px] ${ratio.trend === "up" ? "text-terminal-green" : ratio.trend === "down" ? "text-terminal-red" : "text-terminal-dim"}`}>
              {ratio.trend === "up" ? "▲" : ratio.trend === "down" ? "▼" : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
