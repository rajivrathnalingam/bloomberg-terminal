import { useMemo } from "react";
import { generateBetaScatter, generateNormalizedPrices } from "@/lib/mockData";

interface RelIndexTabProps {
  ticker: string;
}

export default function RelIndexTab({ ticker }: RelIndexTabProps) {
  const scatterData = useMemo(() => generateBetaScatter(), [ticker]);
  const normalizedPrices = useMemo(() => generateNormalizedPrices([ticker, "SPY"]), [ticker]);

  const betaStats = {
    rawBeta: 1.884,
    adjustedBeta: 1.589,
    alpha: 0.314,
    rSquared: 0.569,
    r: 0.754,
    stdDev: 3.820,
    stdErrorAlpha: 0.523,
    stdErrorBeta: 0.227,
    tTest: 8.283,
    significance: "<0.001",
    lastTValue: 0.661,
    lastPValue: 0.508,
    numPoints: 54,
    lastSpread: -495.64,
    lastRatio: 0.284,
  };

  const chartWidth = 600;
  const chartHeight = 300;
  const padding = 40;

  // Scatter plot bounds
  const xMin = -10, xMax = 8, yMin = -20, yMax = 20;
  const scaleX = (v: number) => padding + ((v - xMin) / (xMax - xMin)) * (chartWidth - 2 * padding);
  const scaleY = (v: number) => chartHeight - padding - ((v - yMin) / (yMax - yMin)) * (chartHeight - 2 * padding);

  // Regression line
  const regX1 = xMin, regY1 = betaStats.rawBeta * xMin + betaStats.alpha;
  const regX2 = xMax, regY2 = betaStats.rawBeta * xMax + betaStats.alpha;

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ overscrollBehavior: "contain" }}>
      {/* Period selectors */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          {["6M", "YTD"].map(p => (
            <button key={p} className="px-2 py-0.5 text-[10px] text-terminal-dim border border-[#333330]">{p}</button>
          ))}
          <button className="px-2 py-0.5 text-[10px] bg-terminal-tab-active text-white border border-[#0077cc]">1Y</button>
          {["2Y", "5Y"].map(p => (
            <button key={p} className="px-2 py-0.5 text-[10px] text-terminal-dim border border-[#333330]">{p}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="px-2 py-0.5 text-[10px] bg-terminal-tab-active text-white border border-[#0077cc]">WEEKLY</button>
          <button className="px-2 py-0.5 text-[10px] text-terminal-dim border border-[#333330]">MONTHLY</button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Scatter Plot */}
        <div>
          <div className="price-chart-area" style={{ height: chartHeight + 20 }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 10}`} className="w-full h-full">
              {/* Grid lines */}
              {[-10, -8, -6, -4, -2, 0, 2, 4, 6, 8].map(v => (
                <line key={`x${v}`} x1={scaleX(v)} y1={padding} x2={scaleX(v)} y2={chartHeight - padding} stroke="#1a1a18" strokeWidth="0.5" />
              ))}
              {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map(v => (
                <line key={`y${v}`} x1={padding} y1={scaleY(v)} x2={chartWidth - padding} y2={scaleY(v)} stroke="#1a1a18" strokeWidth="0.5" />
              ))}

              {/* Y axis labels */}
              {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map(v => (
                <text key={`yl${v}`} x={padding - 5} y={scaleY(v) + 3} fill="#666655" fontSize="8" textAnchor="end" fontFamily="var(--font-mono)">{v}.0%</text>
              ))}

              {/* X axis labels */}
              {[-10, -8, -6, -4, -2, 0, 2, 4, 6].map(v => (
                <text key={`xl${v}`} x={scaleX(v)} y={chartHeight - padding + 15} fill="#666655" fontSize="8" textAnchor="middle" fontFamily="var(--font-mono)">{v}.0%</text>
              ))}

              {/* Histogram bars on X axis */}
              {Array.from({ length: 30 }, (_, i) => {
                const binCenter = xMin + (i + 0.5) * (xMax - xMin) / 30;
                const count = scatterData.filter(d => Math.abs(d.x - binCenter) < (xMax - xMin) / 60).length;
                const barHeight = count * 3;
                return (
                  <rect
                    key={`bar${i}`}
                    x={scaleX(binCenter) - 3}
                    y={scaleY(0) - barHeight}
                    width={6}
                    height={barHeight}
                    fill="#cc8800"
                    opacity="0.4"
                  />
                );
              })}

              {/* Regression line */}
              <line
                x1={scaleX(regX1)} y1={scaleY(regY1)}
                x2={scaleX(regX2)} y2={scaleY(regY2)}
                stroke="#ff3333"
                strokeWidth="1.5"
              />

              {/* Scatter points */}
              {scatterData.map((d, i) => (
                <circle
                  key={i}
                  cx={scaleX(d.x)}
                  cy={scaleY(d.y)}
                  r="3"
                  fill="#cc8800"
                  stroke="#aa7700"
                  strokeWidth="0.5"
                />
              ))}

              {/* Equation label */}
              <rect x={chartWidth / 2 - 70} y={padding - 5} width={140} height={18} fill="rgba(0,50,0,0.7)" stroke="#00cc00" strokeWidth="0.5" rx="2" />
              <text x={chartWidth / 2} y={padding + 8} fill="#00cc00" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                Y = {betaStats.rawBeta}·X + {betaStats.alpha}
              </text>

              {/* Axis labels */}
              <text x={chartWidth / 2} y={chartHeight} fill="#666655" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
                SPX Index % Change
              </text>
              <text x={12} y={chartHeight / 2} fill="#666655" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)" transform={`rotate(-90, 12, ${chartHeight / 2})`}>
                {ticker} % Change
              </text>
            </svg>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="bg-[#0a0a33] border border-[#333366] p-2">
          <div className="text-xs space-y-0.5">
            <div className="text-terminal-yellow mb-1">Y = <span className="text-terminal-white font-bold">NVIDIA CORP</span></div>
            <div className="text-terminal-yellow mb-2">X = <span className="text-terminal-white font-bold">S&P 500 INDEX (SPY)</span></div>

            <div className="border-b border-[#333366] pb-1 mb-1">
              <div className="flex justify-between"><span className="text-terminal-cyan">Linear Beta</span><span className="text-terminal-dim">Range 1</span></div>
            </div>

            {[
              ["Raw BETA", betaStats.rawBeta.toFixed(3)],
              ["Adjusted BETA", betaStats.adjustedBeta.toFixed(3)],
              ["ALPHA (Intercept)", betaStats.alpha.toFixed(3)],
              ["R² (Correlation²)", betaStats.rSquared.toFixed(3)],
              ["R (Correlation)", betaStats.r.toFixed(3)],
              ["Std Dev of BETA", betaStats.stdDev.toFixed(3)],
              ["Std Error of ALPHA", betaStats.stdErrorAlpha.toFixed(3)],
              ["Std Error of BETA", betaStats.stdErrorBeta.toFixed(3)],
              ["t-Test", betaStats.tTest.toFixed(3)],
              ["Significance", betaStats.significance],
              ["Last T-Value", betaStats.lastTValue.toFixed(3)],
              ["Last P-Value", betaStats.lastPValue.toFixed(3)],
              ["Number of Points", betaStats.numPoints.toString()],
              ["Last Spread", betaStats.lastSpread.toFixed(2)],
              ["Last Ratio", betaStats.lastRatio.toFixed(3)],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-terminal-white">{label}</span>
                <span className="text-terminal-white font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Normalized Price Overlay */}
      <div className="mt-4">
        <div className="text-[11px] text-terminal-white mb-1">
          NORMALIZED PRICE OVERLAY (Base 100) | Weekly 1Y | 02/25/25 – 02/24/26
        </div>
        <div className="price-chart-area" style={{ height: 100 }}>
          <svg viewBox="0 0 800 80" className="w-full h-full">
            {/* NVDA line */}
            {normalizedPrices[ticker] && (
              <polyline
                fill="none"
                stroke="#cc8800"
                strokeWidth="1.5"
                points={normalizedPrices[ticker].map((d, i) => {
                  const x = (i / (normalizedPrices[ticker].length - 1)) * 780;
                  const y = 70 - ((d.value - 50) / 200) * 60;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {/* SPY line */}
            {normalizedPrices["SPY"] && (
              <polyline
                fill="none"
                stroke="#ccccaa"
                strokeWidth="1"
                opacity="0.5"
                points={normalizedPrices["SPY"].map((d, i) => {
                  const x = (i / (normalizedPrices["SPY"].length - 1)) * 780;
                  const y = 70 - ((d.value - 50) / 200) * 60;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {/* 100 baseline */}
            <line x1="0" y1={70 - ((100 - 50) / 200) * 60} x2="780" y2={70 - ((100 - 50) / 200) * 60} stroke="#333330" strokeWidth="0.5" strokeDasharray="4,4" />
          </svg>
        </div>
        <div className="flex items-center gap-4 justify-center mt-1 text-[10px]">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#cc8800]" /><span className="text-terminal-white">{ticker} (Base 100)</span></span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#ccccaa] opacity-50" /><span className="text-terminal-white">SPX/SPY (Base 100)</span></span>
        </div>
      </div>
    </div>
  );
}
