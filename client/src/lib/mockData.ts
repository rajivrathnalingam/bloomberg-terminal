import type { NewsItem, InsiderTransaction, InstitutionalHolder, DebtData, PeerCompany, HistoricalPrice } from "./types";

// Generate mock price data for last year
export function generatePriceHistory(months: number = 12): HistoricalPrice[] {
  const data: HistoricalPrice[] = [];
  const now = new Date();
  let price = 90;
  
  for (let i = months * 22; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const change = (Math.random() - 0.48) * 4;
    price = Math.max(75, Math.min(220, price + change));
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: price - Math.random() * 2,
      high: price + Math.random() * 3,
      low: price - Math.random() * 3,
      close: price,
      volume: Math.floor(Math.random() * 50000000) + 100000000,
    });
  }
  return data;
}

export const TICKER_TAPE_DATA = [
  { symbol: "SPY", price: 692.36, change: 5.02, pct: 0.73 },
  { symbol: "QQQ", price: 615.37, change: 7.54, pct: 1.24 },
  { symbol: "AAPL", price: 274.34, change: 2.17, pct: 0.80 },
  { symbol: "MSFT", price: 398.74, change: 9.69, pct: 2.49 },
  { symbol: "NVDA", price: 196.72, change: 3.84, pct: 1.99 },
  { symbol: "AMZN", price: 209.21, change: 0.72, pct: 0.35 },
  { symbol: "META", price: 649.24, change: 9.70, pct: 1.52 },
  { symbol: "TSLA", price: 415.17, change: 5.15, pct: 1.26 },
  { symbol: "GOOGL", price: 310.33, change: -0.46, pct: -0.15 },
  { symbol: "JPM", price: 303.23, change: 5.91, pct: 1.99 },
];

export const NEWS_DATA: NewsItem[] = [
  { id: 900, source: "THE MOTL", time: "08:30", title: "Is AMD Stock Going to $300 After the Meta Platforms Deal?" },
  { id: 899, source: "INVESTIN", time: "08:01", title: "Nvidia Earnings Preview: A Make-or-Break Moment for the AI Trade" },
  { id: 898, source: "BENZINGA", time: "05:37", title: "Stock Market Today: S&P 500, Dow, Nasdaq Futures Rise After Trump's State Of The Union Add..." },
  { id: 897, source: "BENZINGA", time: "04:06", title: "China's Top Chipmakers Race To Scale Advanced AI Chips Despite US Curbs As Demand Surges: ..." },
  { id: 896, source: "THE MOTL", time: "03:10", title: "IT Spending Will Exceed $6 Trillion for the First Time in 2026 Thanks to Artificial Intell..." },
  { id: 895, source: "BENZINGA", time: "01:34", title: "Microsoft, Nvidia-Backed Wayve Gets $1.5 Billion Funding Boost For Robotaxi Tech Rollout" },
  { id: 894, source: "INVESTIN", time: "22:35", title: "Nvidia Earnings Preview: Can It Revive the AI Trade?" },
  { id: 893, source: "THE MOTL", time: "22:05", title: "Why I'm Not Buying Nvidia Stock" },
];

export const FULL_NEWS_DATA: NewsItem[] = [
  { id: 1, source: "INVE", time: "Feb 25, 13:10", title: "Stock Market Today: Stocks Surge Ahead of Nvidia Results; Tech Shares Help Major Indexes Rebound Further After Tumbli..." },
  { id: 2, source: "CNBC", time: "Feb 25, 13:05", title: "Stocks rise, adding to Tuesday's comeback as Nvidia and Oracle shares gain: Live updates – CNBC" },
  { id: 3, source: "MARK", time: "Feb 25, 13:00", title: "Nvidia earnings are only hours away. Here's what matters for the stock. – MarketWatch" },
  { id: 4, source: "KIPL", time: "Feb 25, 12:58", title: "Nvidia Earnings: Live Updates and Commentary February 2026 – Kiplinger" },
  { id: 5, source: "INVE", time: "Feb 25, 12:49", title: "Stock Market Today: Nasdaq, Dow Hold Gains Before Nvidia Earnings; Vertiv, Keysight Advance (Live Coverage) – Investo..." },
  { id: 6, source: "TIPR", time: "Feb 25, 12:43", title: "Ex-Google Engineers Secure $500 Million for Nvidia Stock Rival MatX – TipRanks" },
  { id: 7, source: "INVE", time: "Feb 25, 12:17", title: "Nvidia's Earnings Could Be a Make or Break Moment for the Stock Market – Investopedia" },
  { id: 8, source: "BARC", time: "Feb 25, 12:12", title: "Should You Buy Nvidia Stock Before GTC 2026? This Analyst Thinks So. – Barchart.com" },
  { id: 9, source: "INVE", time: "Feb 25, 12:12", title: "The Market Awaits Nvidia But This Data Center Builder Is Already Soaring On Earnings – Investor's Business Daily" },
  { id: 10, source: "CNBC", time: "Feb 25, 12:00", title: "Nvidia set to report quarterly results after the bell – CNBC" },
  { id: 11, source: "YAHO", time: "Feb 25, 11:51", title: "Stock Market Today, Feb. 25: Investors brace for Nvidia, Salesforce after market close – Yahoo Finance Singa..." },
  { id: 12, source: "BARR", time: "Feb 25, 11:51", title: "Nvidia Stock Edges Higher Ahead of Earnings. Data Center Revenue Is Key. – Barron's" },
  { id: 13, source: "YAHO", time: "Feb 25, 11:33", title: "Jim Cramer is Still Enthusiastic About NVIDIA (NVDA) – Yahoo Finance" },
  { id: 14, source: "THE", time: "Feb 25, 11:30", title: "Is AMD Stock Going to $300 After the Meta Platforms Deal?" },
  { id: 15, source: "INVE", time: "Feb 25, 11:28", title: "Dow Jones AI Giant Nvidia Eyes Buy Point With Earnings Set To Surge 72% – Investor's Business Daily" },
  { id: 16, source: "BENZ", time: "Feb 25, 11:23", title: "Will Nvidia Beat Earnings Estimates? 84% Of Benzinga Readers Say This – Benzinga" },
  { id: 17, source: "INVE", time: "Feb 25, 11:18", title: "How Much Is Nvidia Stock Expected to Move After the AI Chipmaker Reports Earnings? – Investopedia" },
  { id: 18, source: "BARC", time: "Feb 25, 11:07", title: "Stocks Climb Ahead of Nvidia's Earnings Results – Barchart.com" },
  { id: 19, source: "INVE", time: "Feb 25, 11:01", title: "Nvidia Earnings Preview: A Make-or-Break Moment for the AI Trade" },
  { id: 20, source: "BARC", time: "Feb 25, 10:56", title: "'The Collapse of Everything AI' Could Hinge on Nvidia's Earnings. What Wall Street Expects from NVDA Stock. – Barchar..." },
  { id: 21, source: "TECH", time: "Feb 25, 10:43", title: "Meta stock rises after $60 billion AMD AI chip pact, with Nvidia earnings next – TechStock?" },
  { id: 22, source: "TRAD", time: "Feb 25, 10:40", title: "Nvidia stock up 1.5%: why earnings can make or break the AI trade – TradingView" },
  { id: 23, source: "TECH", time: "Feb 25, 10:38", title: "Apple stock ticks up after shareholders reject 'China audit' proposal; Nvidia earnings in view – TechStock?" },
  { id: 24, source: "TECH", time: "Feb 25, 10:23", title: "Micron (MU) stock climbs as Nvidia earnings loom and Micron sets March 18 update – TechStock?" },
  { id: 25, source: "BUSI", time: "Feb 25, 10:08", title: "Short-seller Andrew Left's new target is a memory stock he says investors are wrongly valuing like it's the next Nvid..." },
];

export const QUICK_TICKERS = [
  "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "BRK-B", "LLY",
  "AVGO", "TSLA", "WMT", "JPM", "V", "XOM", "UNH", "MA",
  "COST", "HD", "PG", "ABBV", "JNJ", "BAC", "KO", "NFLX",
  "INTC", "QCOM", "NOW", "PANW", "UBER", "PLTR", "COIN", "F", "GM", "BA", "GE"
];

export const PEER_DATA: PeerCompany[] = [
  { symbol: "NVDA", name: "NVIDIA CORP", marketCap: 4.69e12, price: 196.72, change1d: 1.99, change1m: 5.51, revenueGrowth: 114.20, epsGrowth: -75.35, pe: 66.24, roe: 91.87, dividendYield: 0.02 },
  { symbol: "AMD", name: "ADVANCED MICRO DEVICES", marketCap: 348.65e9, price: 212.42, change1d: -0.77, change1m: -15.48, revenueGrowth: 34.34, epsGrowth: 164.36, pe: 79.56, roe: 6.88, dividendYield: 0 },
  { symbol: "INTC", name: "INTEL CORP", marketCap: 230.38e9, price: 46.80, change1d: 1.01, change1m: 10.15, revenueGrowth: -0.47, epsGrowth: 98.63, pe: 0, roe: 0.02, dividendYield: 0 },
  { symbol: "AVGO", name: "BROADCOM INC.", marketCap: 1.54e12, price: 332.57, change1d: 2.24, change1m: 2.31, revenueGrowth: 23.87, epsGrowth: 286.61, pe: 67.73, roe: 28.45, dividendYield: 0.73 },
  { symbol: "QCOM", name: "QUALCOMM INC", marketCap: 154.48e9, price: 145.12, change1d: 0.17, change1m: -6.05, revenueGrowth: 13.66, epsGrowth: -44.44, pe: 28.74, roe: 26.13, dividendYield: 3.04 },
  { symbol: "TXN", name: "TEXAS INSTRUMENTS INCORPORATED", marketCap: 193.63e9, price: 213.00, change1d: -0.08, change1m: 8.31, revenueGrowth: 0.93, epsGrowth: -23.28, pe: 38.94, roe: 30.73, dividendYield: 2.61 },
  { symbol: "MRVL", name: "MARVELL TECHNOLOGY, INC.", marketCap: 66.42e9, price: 81.14, change1d: 3.04, change1m: -0.73, revenueGrowth: 4.71, epsGrowth: 5.56, pe: 0, roe: -6.59, dividendYield: 0.30 },
  { symbol: "ARM", name: "ARM HOLDINGS", marketCap: 136.08e9, price: 133.03, change1d: 3.60, change1m: 16.04, revenueGrowth: 0, epsGrowth: 0, pe: 0, roe: 0, dividendYield: 0 },
];

export const INSIDER_TRANSACTIONS: InsiderTransaction[] = Array.from({ length: 50 }, (_, i) => ({
  name: "Colette Kress",
  title: "EVP Chief Financial Officer",
  date: "2026-02-04",
  shares: -Math.floor(Math.random() * 2500 + 400),
  price: 170 + Math.random() * 10,
  type: "Sale",
}));

export const INSTITUTIONAL_HOLDERS: InstitutionalHolder[] = [
  { name: "VANGUARD GROUP INC", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "STATE STREET CORP", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "FMR LLC", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "GEODE CAPITAL MANAGEMENT, LLC", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "JPMORGAN CHASE & CO", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "PRICE T ROWE ASSOCIATES INC /MD/", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "NORGES BANK", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "MORGAN STANLEY", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "NORTHERN TRUST CORP", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "UBS AM, a distinct business unit of UBS ASSET MANAGEMENT AMERICAS LLC", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "BANK OF AMERICA CORP /DE/", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "Capital Research Global Investors", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "Legal & General Group Plc", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "GOLDMAN SACHS GROUP INC", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "Bank of New York Mellon Corp", shares: 0, value: 0, percentage: 0, source: "13F" },
  { name: "CHARLES SCHWAB INVESTMENT MANAGEMENT INC", shares: 0, value: 0, percentage: 0, source: "13F" },
];

export const DEBT_DATA: DebtData[] = [
  { year: "2025-FY", totalDebt: "$10.0B", currentDebt: "$0.0B", longTermDebt: "$10.0B", totalLiabilities: "$32.3B", currentLiabilities: "$18.0B", nonCurrentLiabilities: "$14.2B", totalAssets: "$111.6B", shareholdersEquity: "$79.3B", debtEquityRatio: "12.6%", debtAssetsRatio: "8.9%", liabilitiesAssets: "28.9%" },
  { year: "2024-FY", totalDebt: "$10.8B", currentDebt: "$1.3B", longTermDebt: "$9.6B", totalLiabilities: "$22.8B", currentLiabilities: "$10.6B", nonCurrentLiabilities: "$12.1B", totalAssets: "$65.7B", shareholdersEquity: "$43.0B", debtEquityRatio: "25.2%", debtAssetsRatio: "16.5%", liabilitiesAssets: "34.6%" },
  { year: "2023-FY", totalDebt: "$11.9B", currentDebt: "$1.3B", longTermDebt: "$10.6B", totalLiabilities: "$19.1B", currentLiabilities: "$6.6B", nonCurrentLiabilities: "$12.5B", totalAssets: "$41.2B", shareholdersEquity: "$22.1B", debtEquityRatio: "53.6%", debtAssetsRatio: "28.8%", liabilitiesAssets: "46.3%" },
  { year: "2022-FY", totalDebt: "$11.7B", currentDebt: "$0.0B", longTermDebt: "$11.7B", totalLiabilities: "$17.6B", currentLiabilities: "$4.3B", nonCurrentLiabilities: "$13.2B", totalAssets: "$44.2B", shareholdersEquity: "$26.6B", debtEquityRatio: "43.9%", debtAssetsRatio: "26.4%", liabilitiesAssets: "39.8%" },
];

// Generate normalized price data for peer comparison
export function generateNormalizedPrices(peers: string[]): Record<string, { date: string; value: number }[]> {
  const result: Record<string, { date: string; value: number }[]> = {};
  const now = new Date();
  
  peers.forEach(symbol => {
    const data: { date: string; value: number }[] = [];
    let value = 100;
    const volatility = symbol === "NVDA" ? 1.5 : Math.random() * 1.2 + 0.5;
    const trend = symbol === "NVDA" ? 0.15 : (Math.random() - 0.3) * 0.1;
    
    for (let i = 260; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      value += (Math.random() - 0.5 + trend) * volatility;
      value = Math.max(40, Math.min(300, value));
      data.push({ date: date.toISOString().split('T')[0], value: Math.round(value * 10) / 10 });
    }
    result[symbol] = data;
  });
  
  return result;
}

// Generate scatter data for beta regression
export function generateBetaScatter(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 54; i++) {
    const x = (Math.random() - 0.5) * 16;
    const y = 1.884 * x + 0.314 + (Math.random() - 0.5) * 8;
    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }
  return points;
}
