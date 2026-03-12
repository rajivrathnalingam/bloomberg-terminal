import { useState } from "react";
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
  return (
    <div>
      <div className="flex items-center gap-4 text-xs mb-3 bg-[rgba(255,255,255,0.02)] p-2">
        <span>Ticker <span className="text-terminal-yellow font-bold">{ticker}</span></span>
        <span>Shrs Out <span className="text-terminal-yellow font-bold">24.30B</span></span>
        <span>Inst % Out <span className="text-terminal-yellow font-bold">42.94%</span></span>
        <span>Holders <span className="text-terminal-yellow font-bold">50</span></span>
        <span>Source <span className="text-terminal-yellow font-bold">13F/SEC EDGAR (Q4 2025)</span></span>
      </div>

      <table className="terminal-table">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th>Holder Name</th>
            <th className="text-right">Source</th>
          </tr>
        </thead>
        <tbody>
          {INSTITUTIONAL_HOLDERS.map((holder, idx) => (
            <tr key={idx} className={idx === 2 ? "highlighted" : ""}>
              <td className="text-terminal-dim">{idx + 1}</td>
              <td className="text-terminal-orange">{holder.name}</td>
              <td className="text-right text-terminal-white">{holder.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsiderTransactionsView({ ticker }: { ticker: string }) {
  return (
    <div>
      <div className="flex items-center gap-4 text-xs mb-3 bg-[rgba(255,255,255,0.02)] p-2">
        <span>Ticker <span className="text-terminal-yellow font-bold">{ticker}</span></span>
        <span>Transactions <span className="text-terminal-yellow font-bold">50</span></span>
        <span>Buys <span className="text-terminal-white font-bold">0</span></span>
        <span>Sells <span className="text-terminal-yellow font-bold">50</span></span>
      </div>

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
          {INSIDER_TRANSACTIONS.slice(0, 20).map((tx, idx) => (
            <tr key={idx}>
              <td className="text-terminal-dim">{idx + 1}</td>
              <td className="text-terminal-orange">{tx.name}</td>
              <td className="text-terminal-white">{tx.title}</td>
              <td className="text-right text-terminal-white">{tx.date}</td>
              <td className="text-right text-terminal-red">{tx.shares.toLocaleString()}</td>
              <td className="text-right text-terminal-white">${tx.price.toFixed(0)}.</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DebtView({ ticker }: { ticker: string }) {
  return (
    <div>
      <table className="terminal-table">
        <thead>
          <tr>
            <th>Line Item</th>
            {DEBT_DATA.map(d => (
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
              {DEBT_DATA.map(d => (
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
