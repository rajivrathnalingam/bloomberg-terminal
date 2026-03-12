import { useMemo } from "react";
import type { HistoricalPrice } from "@/lib/types";

interface PriceChartProps {
  data: HistoricalPrice[];
  height?: number;
  showAxis?: boolean;
  color?: string;
}

export default function PriceChart({ data, height = 140, showAxis = true, color = "#3399ff" }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return { path: "", minY: 0, maxY: 0, labels: [] as string[] };

    const prices = data.map(d => d.close);
    const minY = Math.min(...prices) * 0.98;
    const maxY = Math.max(...prices) * 1.02;
    const width = 460;
    const h = height - 20;

    const points = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = h - ((p - minY) / (maxY - minY)) * h;
      return `${x},${y}`;
    });

    // Create area fill path
    const areaPath = `M0,${h} L${points.join(' L')} L${width},${h} Z`;
    const linePath = `M${points.join(' L')}`;

    // Date labels
    const step = Math.floor(data.length / 8);
    const labels = data.filter((_, i) => i % step === 0).map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
    });

    // Price labels
    const priceStep = (maxY - minY) / 4;
    const priceLabels = Array.from({ length: 5 }, (_, i) => Math.round(minY + priceStep * i));

    return { linePath, areaPath, minY, maxY, labels, priceLabels, width };
  }, [data, height]);

  if (!data.length) return <div className="h-[140px] bg-terminal-bg" />;

  return (
    <div className="price-chart-area relative" style={{ height }}>
      <svg viewBox={`0 0 500 ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {chartData.priceLabels?.map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={((height - 20) / 4) * i}
            x2="460"
            y2={((height - 20) / 4) * i}
            stroke="#222220"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        <path d={chartData.areaPath} fill={color} opacity="0.08" />

        {/* Price line */}
        <path d={chartData.linePath} fill="none" stroke={color} strokeWidth="1.5" />

        {/* Y-axis labels */}
        {showAxis && chartData.priceLabels?.map((price, i) => (
          <text
            key={i}
            x="465"
            y={((height - 20) / 4) * (4 - i) + 4}
            fill="#666655"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            {price}
          </text>
        ))}
      </svg>

      {/* X-axis labels */}
      {showAxis && (
        <div className="absolute bottom-0 left-0 right-12 flex justify-between text-[9px] text-terminal-dim px-1">
          {chartData.labels?.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
