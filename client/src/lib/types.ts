export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  marketCap: number;
  pe: number;
  eps: number;
  volume: number;
  avgVolume: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  previousClose: number;
  open: number;
  dividendYieldTTM: number;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  ceo: string;
  fullTimeEmployees: number;
  website: string;
  description: string;
  city: string;
  state: string;
  country: string;
  exchange: string;
  isin: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PeerCompany {
  symbol: string;
  name: string;
  marketCap: number;
  price: number;
  change1d: number;
  change1m: number;
  revenueGrowth: number;
  epsGrowth: number;
  pe: number;
  roe: number;
  dividendYield: number;
}

export interface InsiderTransaction {
  name: string;
  title: string;
  date: string;
  shares: number;
  price: number;
  type: string;
}

export interface InstitutionalHolder {
  name: string;
  shares: number;
  value: number;
  percentage: number;
  source: string;
}

export interface NewsItem {
  id: number;
  source: string;
  time: string;
  title: string;
  url?: string;
}

export interface DebtData {
  year: string;
  totalDebt: string;
  currentDebt: string;
  longTermDebt: string;
  totalLiabilities: string;
  currentLiabilities: string;
  nonCurrentLiabilities: string;
  totalAssets: string;
  shareholdersEquity: string;
  debtEquityRatio: string;
  debtAssetsRatio: string;
  liabilitiesAssets: string;
}

export interface FinancialEstimates {
  date: string;
  pe: number;
  estPe: number;
  t12mEps: number;
  estEps: number;
  estPeg: number | null;
}

export type TabId = 'home' | 'overview' | 'analysis' | 'relindex' | 'relvalue' | 'news' | 'ownership';
