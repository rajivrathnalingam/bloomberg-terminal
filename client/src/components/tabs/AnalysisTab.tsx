import { useState, useEffect } from "react";

interface AnalysisTabProps {
  ticker: string;
  companyName: string;
}

interface FinancialRow {
  date?: string;
  period?: string;
  revenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
  eps?: number;
  ebitda?: number;
  ebitdaRatio?: number;
  [key: string]: unknown;
}

interface BalanceRow {
  date?: string;
  period?: string;
  totalDebt?: number;
  totalStockholdersEquity?: number;
  cashAndCashEquivalents?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  [key: string]: unknown;
}

interface CashRow {
  date?: string;
  period?: string;
  freeCashFlow?: number;
  [key: string]: unknown;
}

function formatB(v: number): string {
  if (Math.abs(v) >= 1e12) return "$" + (v / 1e12).toFixed(1) + "T";
  if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
  if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  return "$" + v.toFixed(0);
}

function extractPeriod(row: any): string {
  if (row.period && typeof row.period === 'string') return row.period;
  if (row.date && typeof row.date === 'string') {
    const year = row.date.substring(0, 4);
    return `FY${year}`;
  }
  return "";
}

export default function AnalysisTab({ ticker, companyName }: AnalysisTabProps) {
  const [incomeData, setIncomeData] = useState<FinancialRow[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceRow[]>([]);
  const [cashData, setCashData] = useState<CashRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchFinancials() {
      try {
        const [finRes, quoteRes] = await Promise.all([
          fetch(`/api/financials/${ticker}`),
          fetch(`/api/quote/${ticker}`),
        ]);

        if (finRes.ok && !cancelled) {
          const data = await finRes.json();
          setIncomeData(data.incomeStatement || []);
          setBalanceData(data.balanceSheet || []);
          setCashData(data.cashFlow || []);
        }
        if (quoteRes.ok && !cancelled) {
          const q = await quoteRes.json();
          setQuoteData(q);
        }
      } catch (err) {
        console.error("Failed to fetch financials:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFinancials();
    return () => { cancelled = true; };
  }, [ticker]);

  // Prepare display data - reverse to show most recent first
  const revenue = incomeData.map(r => ({ period: extractPeriod(r), value: r.revenue || 0 }));
  const grossProfit = incomeData.map((r, i) => ({ period: extractPeriod(r), value: r.grossProfit || 0, revenue: r.revenue || 1 }));
  const netIncome = incomeData.map((r, i) => ({ period: extractPeriod(r), value: r.netIncome || 0, revenue: r.revenue || 1 }));
  const operatingMargin = incomeData.map(r => ({
    period: extractPeriod(r),
    value: r.revenue && r.operatingIncome ? (r.operatingIncome / r.revenue * 100) : 0,
  }));

  const maxRevenue = Math.max(...revenue.map(r => r.value), 1);

  // Key ratios from quote + financials
  const pe = quoteData?.pe ?? 0;
  const price = quoteData?.price ?? 0;
  const marketCap = quoteData?.marketCap ?? 0;
  const latestIncome = incomeData[incomeData.length - 1];
  const latestBalance = balanceData[balanceData.length - 1];
  const latestCash = cashData[cashData.length - 1];

  const grossMargin = latestIncome?.revenue && latestIncome?.grossProfit
    ? ((latestIncome.grossProfit / latestIncome.revenue) * 100).toFixed(1) + "%"
    : "N/A";
  const netMargin = latestIncome?.revenue && latestIncome?.netIncome
    ? ((latestIncome.netIncome / latestIncome.revenue) * 100).toFixed(1) + "%"
    : "N/A";
  const debtEquity = latestBalance?.totalDebt && latestBalance?.totalStockholdersEquity
    ? ((latestBalance.totalDebt / latestBalance.totalStockholdersEquity) * 100).toFixed(1) + "%"
    : "N/A";
  const roe = latestIncome?.netIncome && latestBalance?.totalStockholdersEquity
    ? ((latestIncome.netIncome / latestBalance.totalStockholdersEquity) * 100).toFixed(2) + "%"
    : "N/A";
  const evEbitda = latestIncome?.ebitda && marketCap > 0
    ? (marketCap / latestIncome.ebitda).toFixed(1)
    : "N/A";
  const priceSales = latestIncome?.revenue && marketCap > 0
    ? (marketCap / latestIncome.revenue).toFixed(1)
    : "N/A";
  const fcfYield = latestCash?.freeCashFlow && marketCap > 0
    ? ((latestCash.freeCashFlow / marketCap) * 100).toFixed(1) + "%"
    : "N/A";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-terminal-yellow text-sm">Loading financial data...</span>
      </div>
    );
  }

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
          {revenue.map(r => (
            <div key={r.period} className="flex items-center gap-3 text-xs">
              <span className="text-terminal-yellow w-16">{r.period}</span>
              <div className="flex-1 h-5 bg-[#111110] relative">
                <div
                  className="h-full bg-[#0055aa]"
                  style={{ width: `${(r.value / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="text-terminal-white w-20 text-right">{formatB(r.value)}</span>
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
              {grossProfit.map(g => (
                <tr key={g.period}>
                  <td className="text-terminal-yellow">{g.period}</td>
                  <td className="text-right text-terminal-white">{formatB(g.value)}</td>
                  <td className="text-right text-terminal-green">
                    {((g.value / g.revenue) * 100).toFixed(1)}%
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
              {netIncome.map(n => (
                <tr key={n.period}>
                  <td className="text-terminal-yellow">{n.period}</td>
                  <td className="text-right text-terminal-white">{formatB(n.value)}</td>
                  <td className="text-right text-terminal-green">
                    {((n.value / n.revenue) * 100).toFixed(1)}%
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
            {operatingMargin.map((m, i) => {
              const x = 60 + i * 120;
              const maxM = Math.max(...operatingMargin.map(o => o.value), 1);
              const barH = (m.value / (maxM * 1.2)) * 80;
              return (
                <g key={m.period}>
                  <rect x={x} y={90 - barH} width={60} height={barH} fill="#0055aa" />
                  <text x={x + 30} y={98} fill="#ccccaa" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">{m.period}</text>
                  <text x={x + 30} y={85 - barH} fill="#00cc00" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">{m.value.toFixed(1)}%</text>
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
          { label: "P/E Ratio", value: pe > 0 ? pe.toFixed(2) : "N/A", trend: "up" },
          { label: "EV/EBITDA", value: evEbitda, trend: "up" },
          { label: "Price/Sales", value: priceSales, trend: "up" },
          { label: "ROE", value: roe, trend: "up" },
          { label: "Gross Margin", value: grossMargin, trend: "up" },
          { label: "Net Margin", value: netMargin, trend: "up" },
          { label: "Debt/Equity", value: debtEquity, trend: "down" },
          { label: "FCF Yield", value: fcfYield, trend: "neutral" },
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
