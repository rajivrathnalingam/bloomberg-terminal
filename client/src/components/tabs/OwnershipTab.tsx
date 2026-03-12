import { useState, useEffect } from "react";
import { INSTITUTIONAL_HOLDERS, INSIDER_TRANSACTIONS, DEBT_DATA } from "@/lib/mockData";

interface OwnershipTabProps {
  ticker: string;
}

type SubTab = "current" | "insider" | "debt";

export default function OwnershipTab({ ticker }: OwnershipTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("current");

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 mb-3">
        {[
          { id: "current" as SubTab, label: "1) Current" },
          { id: "insider" as SubTab, label: "2) Insider Transactions" },
          { id: "debt" as SubTab, label: "3) Debt" },
        ].map(tab => (
          <button
            key={tab.id}
            data-testid={`subtab-${tab.id}`}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3 py-1 text-xs cursor-pointer ${
              activeSubTab === tab.id ? "subtab-active" : "subtab-inactive"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "current" && <CurrentHolders ticker={ticker} />}
      {activeSubTab === "insider" && <InsiderTransactionsView ticker={ticker} />}
      {activeSubTab === "debt" && <DebtView ticker={ticker} />}
    </div>
  );
}

function CurrentHolders({ ticker }: { ticker: string }) {
  const [holders, setHolders] = useState(INSTITUTIONAL_HOLDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function fetchHolders() {
      try {
        const res = await fetch(`/api/holdings/${ticker}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.institutionalHolders && data.institutionalHolders.length > 0) {
            setHolders(data.institutionalHolders);
          }
        }
      } catch { /* keep mock */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchHolders();
    return () => { cancelled = true; };
  }, [ticker]);

  return (
    <div>
      <div className="flex items-center gap-4 text-xs mb-3 bg-[rgba(255,255,255,0.02)] p-2">
        <span>Ticker <span className="text-terminal-yellow font-bold">{ticker}</span></span>
        <span>Holders <span className="text-terminal-yellow font-bold">{holders.length}</span></span>
        <span>Source <span className="text-terminal-yellow font-bold">SEC EDGAR</span></span>
      </div>

      {loading && <div className="text-terminal-yellow text-xs mb-2">Loading holders...</div>}

      <table className="terminal-table">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th>Holder Name</th>
            <th className="text-right">Shares</th>
            <th className="text-right">Value</th>
            <th className="text-right">%</th>
            <th className="text-right">Source</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((holder, idx) => (
            <tr key={idx} className={idx === 0 ? "highlighted" : ""}>
              <td className="text-terminal-dim">{idx + 1}</td>
              <td className="text-terminal-orange">{holder.name}</td>
              <td className="text-right text-terminal-white">{holder.shares > 0 ? holder.shares.toLocaleString() : "—"}</td>
              <td className="text-right text-terminal-white">{holder.value > 0 ? "$" + (holder.value / 1e6).toFixed(1) + "M" : "—"}</td>
              <td className="text-right text-terminal-yellow">{holder.percentage > 0 ? holder.percentage.toFixed(2) + "%" : "—"}</td>
              <td className="text-right text-terminal-white">{holder.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsiderTransactionsView({ ticker }: { ticker: string }) {
  const [transactions, setTransactions] = useState(INSIDER_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function fetchInsider() {
      try {
        const res = await fetch(`/api/holdings/${ticker}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.insiderTransactions && data.insiderTransactions.length > 0) {
            setTransactions(data.insiderTransactions);
          }
        }
      } catch { /* keep mock */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchInsider();
    return () => { cancelled = true; };
  }, [ticker]);

  const buys = transactions.filter(t => t.shares > 0).length;
  const sells = transactions.filter(t => t.shares < 0 || t.type?.toLowerCase().includes('sale')).length;

  return (
    <div>
      <div className="flex items-center gap-4 text-xs mb-3 bg-[rgba(255,255,255,0.02)] p-2">
        <span>Ticker <span className="text-terminal-yellow font-bold">{ticker}</span></span>
        <span>Transactions <span className="text-terminal-yellow font-bold">{transactions.length}</span></span>
        <span>Buys <span className="text-terminal-green font-bold">{buys}</span></span>
        <span>Sells <span className="text-terminal-red font-bold">{sells}</span></span>
      </div>

      {loading && <div className="text-terminal-yellow text-xs mb-2">Loading insider transactions...</div>}

      <table className="terminal-table">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th>Insider Name</th>
            <th>Title</th>
            <th className="text-right">Trans Date</th>
            <th className="text-right">Shares</th>
            <th className="text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, 30).map((tx, idx) => (
            <tr key={idx}>
              <td className="text-terminal-dim">{idx + 1}</td>
              <td className="text-terminal-orange">{tx.name}</td>
              <td className="text-terminal-white">{tx.title}</td>
              <td className="text-right text-terminal-white">{tx.date}</td>
              <td className={`text-right ${tx.shares >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                {tx.shares.toLocaleString()}
              </td>
              <td className="text-right text-terminal-white">${typeof tx.price === 'number' ? tx.price.toFixed(2) : tx.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DebtView({ ticker }: { ticker: string }) {
  const [debtData, setDebtData] = useState(DEBT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function fetchDebt() {
      try {
        const res = await fetch(`/api/financials/${ticker}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const bs = data.balanceSheet || [];
          if (bs.length > 0) {
            const formatted = bs.map((row: any) => {
              const period = row.period || (row.date ? row.date.substring(0, 4) + "-FY" : "");
              const fmtB = (v: number) => v ? "$" + (Math.abs(v) / 1e9).toFixed(1) + "B" : "$0.0B";
              const equity = row.totalStockholdersEquity || 1;
              const assets = row.totalAssets || 1;
              const debt = row.totalDebt || 0;
              const liabilities = row.totalLiabilities || 0;
              return {
                year: period,
                totalDebt: fmtB(debt),
                currentDebt: fmtB(row.shortTermDebt || 0),
                longTermDebt: fmtB(row.longTermDebt || 0),
                totalLiabilities: fmtB(liabilities),
                currentLiabilities: fmtB(row.totalCurrentLiabilities || 0),
                nonCurrentLiabilities: fmtB(row.totalNonCurrentLiabilities || 0),
                totalAssets: fmtB(row.totalAssets || 0),
                shareholdersEquity: fmtB(equity),
                debtEquityRatio: equity > 0 ? ((debt / equity) * 100).toFixed(1) + "%" : "N/A",
                debtAssetsRatio: assets > 0 ? ((debt / assets) * 100).toFixed(1) + "%" : "N/A",
                liabilitiesAssets: assets > 0 ? ((liabilities / assets) * 100).toFixed(1) + "%" : "N/A",
              };
            });
            setDebtData(formatted);
          }
        }
      } catch { /* keep mock */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchDebt();
    return () => { cancelled = true; };
  }, [ticker]);

  return (
    <div>
      {loading && <div className="text-terminal-yellow text-xs mb-2">Loading debt data...</div>}
      <table className="terminal-table">
        <thead>
          <tr>
            <th>Line Item</th>
            {debtData.map(d => (
              <th key={d.year} className="text-right">{d.year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { label: "Total Debt", key: "totalDebt", color: "text-terminal-orange" },
            { label: "Current Debt (Due < 1yr)", key: "currentDebt", color: "text-terminal-orange" },
            { label: "Long-Term Debt", key: "longTermDebt", color: "text-terminal-white" },
            { label: "Total Liabilities", key: "totalLiabilities", color: "text-terminal-orange" },
            { label: "Current Liabilities", key: "currentLiabilities", color: "text-terminal-orange" },
            { label: "Non-Current Liabilities", key: "nonCurrentLiabilities", color: "text-terminal-white" },
            { label: "Total Assets", key: "totalAssets", color: "text-terminal-orange" },
            { label: "Shareholders' Equity", key: "shareholdersEquity", color: "text-terminal-orange" },
            { label: "Debt / Equity Ratio", key: "debtEquityRatio", color: "text-terminal-orange" },
            { label: "Debt / Assets Ratio", key: "debtAssetsRatio", color: "text-terminal-white" },
            { label: "Liabilities / Assets", key: "liabilitiesAssets", color: "text-terminal-white" },
          ].map(row => (
            <tr key={row.key}>
              <td className={row.color}>{row.label}</td>
              {debtData.map(d => (
                <td key={d.year} className="text-right text-terminal-white">
                  {(d as any)[row.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
