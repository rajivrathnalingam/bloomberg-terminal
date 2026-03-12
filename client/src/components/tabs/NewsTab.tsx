import { FULL_NEWS_DATA, QUICK_TICKERS } from "@/lib/mockData";

interface NewsTabProps {
  ticker: string;
  onTickerChange: (ticker: string) => void;
}

export default function NewsTab({ ticker, onTickerChange }: NewsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      {/* Quick ticker links */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-[11px] mb-1">
          <span className="text-terminal-dim">QUICK:</span>
          <div className="flex flex-wrap gap-1">
            {QUICK_TICKERS.slice(0, 35).map(t => (
              <button
                key={t}
                data-testid={`quick-ticker-${t}`}
                onClick={() => onTickerChange(t)}
                className={`px-1.5 py-0.5 ${
                  t === ticker ? "bg-terminal-tab-active text-white" : "text-terminal-white hover:bg-[rgba(255,255,255,0.05)]"
                } cursor-pointer transition-colors`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh timer */}
      <div className="text-[11px] text-terminal-dim mb-3">
        Next refresh in: 29:33
      </div>

      {/* News list */}
      <div className="space-y-0">
        {FULL_NEWS_DATA.map((news, idx) => (
          <div
            key={news.id}
            className="flex items-start gap-3 text-xs py-1 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer border-b border-[rgba(255,255,255,0.02)]"
          >
            <span className="text-terminal-white w-6 text-right flex-shrink-0">{idx + 1}</span>
            <span className={`w-10 flex-shrink-0 font-bold ${
              ["CNBC", "MARK", "YAHO", "BARR"].includes(news.source) ? "text-terminal-orange" :
              ["INVE", "BARC"].includes(news.source) ? "text-terminal-orange" :
              ["KIPL"].includes(news.source) ? "text-terminal-orange" :
              ["TECH", "TRAD"].includes(news.source) ? "text-terminal-cyan" :
              ["BENZ", "BUSI"].includes(news.source) ? "text-terminal-orange" :
              "text-terminal-orange"
            }`}>{news.source}</span>
            <span className="text-terminal-dim w-28 flex-shrink-0">{news.time}</span>
            <span className="text-terminal-white flex-1">{news.title}</span>
            <span className="text-terminal-blue flex-shrink-0">●</span>
          </div>
        ))}
      </div>
    </div>
  );
}
