import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// In-memory cache with TTL
// ---------------------------------------------------------------------------
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL_MS = 60_000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Finance API helper
// ---------------------------------------------------------------------------
async function callFinanceTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ content: string; csv_files?: string[] }> {
  const params = JSON.stringify({
    source_id: "finance",
    tool_name: toolName,
    arguments: args,
  });
  const { stdout } = await execFileAsync("external-tool", ["call", params], {
    timeout: 30_000,
  });
  return JSON.parse(stdout);
}

// ---------------------------------------------------------------------------
// Markdown table parser
// ---------------------------------------------------------------------------
function parseMarkdownTable(markdown: string): Record<string, unknown>[] {
  const lines = markdown.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return [];

  const extractCells = (line: string): string[] =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

  const headers = extractCells(lines[0]);

  // Find the first data row (skip separator rows like | --- | --- |)
  const dataRows: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = extractCells(lines[i]);
    const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));
    if (!isSeparator) dataRows.push(lines[i]);
  }

  return dataRows
    .map((row) => {
      const cells = extractCells(row);
      const obj: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        const raw = cells[idx] ?? "";
        // Try to convert to number (strip commas, %, $, B, M, T suffixes)
        const cleaned = raw.replace(/[$,%]/g, "").replace(/,/g, "").trim();
        if (cleaned === "" || cleaned === "N/A" || cleaned === "-") {
          obj[header] = raw;
        } else {
          const num = Number(cleaned);
          obj[header] = isNaN(num) ? raw : num;
        }
      });
      return obj;
    })
    // Filter out rows that are just the header repeated (value === header name)
    .filter((obj) => {
      const keys = Object.keys(obj);
      const headerDupes = keys.filter((k) => obj[k] === k);
      return headerDupes.length < keys.length / 2;
    });
}

// ---------------------------------------------------------------------------
// CSV parser
// ---------------------------------------------------------------------------
function parseCSV(csv: string): Record<string, unknown>[] {
  const lines = csv.trim().split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      const raw = values[idx] ?? "";
      const num = Number(raw);
      obj[header] = raw === "" || isNaN(num) ? raw : num;
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Profile parser (bullet-point format)
// ---------------------------------------------------------------------------
function parseProfileContent(
  markdown: string,
  ticker: string,
): Record<string, string> {
  const profile: Record<string, string> = {};

  // Extract company name from header like **NVDA - NVIDIA Corporation**
  const headerMatch = markdown.match(
    /\*\*\s*\w+\s*[-–—]\s*(.+?)\s*\*\*/,
  );
  if (headerMatch) profile.companyName = headerMatch[1];

  // Extract key-value pairs from bullet points: - **Key:** Value
  const kvRegex = /[-*]\s*\*\*(.+?):?\*\*:?\s*(.+)/g;
  let match: RegExpExecArray | null;
  while ((match = kvRegex.exec(markdown)) !== null) {
    const key = match[1].replace(/:$/, "").trim();
    const value = match[2].trim();
    profile[key] = value;
  }

  // Extract description – usually after **Description:** or as last paragraph
  const descMatch = markdown.match(
    /\*\*Description:?\*\*:?\s*([\s\S]+?)(?:\n\n|\n\*\*|$)/i,
  );
  if (descMatch) profile.Description = descMatch[1].trim();

  profile.symbol = ticker;
  return profile;
}

// ---------------------------------------------------------------------------
// Helpers for mapping parsed data to expected shapes
// ---------------------------------------------------------------------------
function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[$,%]/g, "").replace(/,/g, "").trim();
    const n = Number(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function buildQuote(
  row: Record<string, unknown>,
  ticker: string,
): Record<string, unknown> {
  // Map common header variations to our expected fields
  const get = (keys: string[]): unknown => {
    for (const k of keys) {
      const val = row[k] ?? row[k.toLowerCase()];
      if (val !== undefined && val !== "" && val !== "N/A") return val;
    }
    return 0;
  };

  return {
    symbol: (row["symbol"] as string) ?? (row["Symbol"] as string) ?? ticker,
    price: toNumber(get(["price", "Price"])),
    change: toNumber(get(["change", "Change"])),
    changesPercentage: toNumber(
      get(["changesPercentage", "changespercentage", "Change %", "change%"]),
    ),
    marketCap: toNumber(get(["marketCap", "Market Cap", "marketcap"])),
    pe: toNumber(get(["pe", "PE", "P/E"])),
    eps: toNumber(get(["eps", "EPS"])),
    volume: toNumber(get(["volume", "Volume"])),
    avgVolume: toNumber(get(["avgVolume", "Avg Volume", "avgvolume"])),
    dayLow: toNumber(get(["dayLow", "Day Low", "daylow"])),
    dayHigh: toNumber(get(["dayHigh", "Day High", "dayhigh"])),
    yearLow: toNumber(get(["yearLow", "Year Low", "yearlow"])),
    yearHigh: toNumber(get(["yearHigh", "Year High", "yearhigh"])),
    previousClose: toNumber(
      get(["previousClose", "Prev Close", "previousclose"]),
    ),
    open: toNumber(get(["open", "Open"])),
    dividendYieldTTM: toNumber(
      get(["dividendYieldTTM", "Dividend Yield", "dividendyieldttm"]),
    ),
  };
}

// ---------------------------------------------------------------------------
// Register all routes
// ---------------------------------------------------------------------------
export async function registerRoutes(server: Server, app: Express) {
  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // -----------------------------------------------------------------------
  // 1. Ticker lookup
  // -----------------------------------------------------------------------
  app.get("/api/ticker-lookup", async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) ?? "";
      if (!q) return res.json([]);

      const cacheKey = `ticker-lookup:${q}`;
      const cached = getCached<unknown[]>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_tickers_lookup", {
        queries: [q],
      });
      const rows = parseMarkdownTable(result.content);
      setCache(cacheKey, rows);
      res.json(rows);
    } catch (err: unknown) {
      console.error("ticker-lookup error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 2. Quote
  // -----------------------------------------------------------------------
  app.get("/api/quote/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `quote:${ticker}`;
      const cached = getCached<Record<string, unknown>>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_quotes", {
        ticker_symbols: [ticker],
        fields: [
          "price",
          "change",
          "changesPercentage",
          "marketCap",
          "pe",
          "eps",
          "volume",
          "avgVolume",
          "dayLow",
          "dayHigh",
          "yearLow",
          "yearHigh",
          "previousClose",
          "open",
          "dividendYieldTTM",
        ],
      });

      const rows = parseMarkdownTable(result.content);
      const quote = rows.length > 0 ? buildQuote(rows[0], ticker) : { symbol: ticker };
      setCache(cacheKey, quote);
      res.json(quote);
    } catch (err: unknown) {
      console.error("quote error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 3. Company profile
  // -----------------------------------------------------------------------
  app.get("/api/profile/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `profile:${ticker}`;
      const cached = getCached<Record<string, unknown>>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_company_profile", {
        ticker_symbols: [ticker],
        query: "Company profile",
        action: "Fetching profile",
      });

      const raw = parseProfileContent(result.content, ticker);

      // Also try parsing as a table in case the API returns tabular data
      const tableRows = parseMarkdownTable(result.content);

      const profile = {
        symbol: ticker,
        companyName:
          raw.companyName ??
          raw["Company Name"] ??
          (tableRows[0]?.["companyName"] as string) ??
          ticker,
        industry:
          raw.Industry ?? (tableRows[0]?.["industry"] as string) ?? "",
        sector: raw.Sector ?? (tableRows[0]?.["sector"] as string) ?? "",
        ceo: raw.CEO ?? (tableRows[0]?.["ceo"] as string) ?? "",
        fullTimeEmployees: toNumber(
          raw.Employees ??
            raw["Full Time Employees"] ??
            tableRows[0]?.["fullTimeEmployees"] ??
            0,
        ),
        website:
          raw.Website ?? (tableRows[0]?.["website"] as string) ?? "",
        city: raw.City ?? (tableRows[0]?.["city"] as string) ?? "",
        state: raw.State ?? (tableRows[0]?.["state"] as string) ?? "",
        country:
          raw.Country ?? (tableRows[0]?.["country"] as string) ?? "",
        description:
          raw.Description ??
          (tableRows[0]?.["description"] as string) ??
          "",
        exchange:
          raw.Exchange ?? (tableRows[0]?.["exchange"] as string) ?? "",
        isin: raw.ISIN ?? (tableRows[0]?.["isin"] as string) ?? "",
      };

      setCache(cacheKey, profile);
      res.json(profile);
    } catch (err: unknown) {
      console.error("profile error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 4. Price history
  // -----------------------------------------------------------------------
  app.get("/api/history/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const months = parseInt((req.query.months as string) ?? "6", 10);

      const cacheKey = `history:${ticker}:${months}`;
      const cached = getCached<unknown[]>(cacheKey);
      if (cached) return res.json(cached);

      const now = new Date();
      const from = new Date(now);
      from.setMonth(from.getMonth() - months);
      const formatDate = (d: Date) => d.toISOString().split("T")[0];

      const result = await callFinanceTool("finance_ohlcv_histories", {
        ticker_symbols: [ticker],
        query: `${ticker} daily price history`,
        start_date_yyyy_mm_dd: formatDate(from),
        end_date_yyyy_mm_dd: formatDate(now),
        fields: ["open", "high", "low", "close", "volume"],
        time_interval: "1day",
      });

      // Try to fetch full CSV data from the csv_files URL
      let history: Record<string, unknown>[] = [];
      const csvFiles = (result as any).csv_files;
      if (csvFiles && csvFiles.length > 0 && csvFiles[0].url) {
        try {
          const csvUrl = csvFiles[0].url;
          const resp = await fetch(csvUrl);
          const csvText = await resp.text();
          // Only parse if it actually looks like CSV (not XML error)
          if (csvText.includes(",") && !csvText.includes("<Error>") && !csvText.startsWith("<?xml")) {
            history = parseCSV(csvText);
          }
        } catch {
          // Fallback below
        }
      }

      // Fallback: parse the markdown table from the content (sampled data)
      if (history.length === 0) {
        const mapRow = (row: Record<string, unknown>) => ({
          date: (row["date"] as string) ?? (row["Date"] as string) ?? "",
          open: toNumber(row["open"] ?? row["Open"]),
          high: toNumber(row["high"] ?? row["High"]),
          low: toNumber(row["low"] ?? row["Low"]),
          close: toNumber(row["close"] ?? row["Close"]),
          volume: toNumber(row["volume"] ?? row["Volume"]),
        });
        history = parseMarkdownTable(result.content).map(mapRow);
      }

      // Filter out rows with no valid close price
      history = history.filter((row) => {
        const close = toNumber(row.close);
        return close > 0 && !isNaN(close);
      });

      setCache(cacheKey, history);
      res.json(history);
    } catch (err: unknown) {
      console.error("history error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 5. Peers
  // -----------------------------------------------------------------------
  app.get("/api/peers/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `peers:${ticker}`;
      const cached = getCached<unknown[]>(cacheKey);
      if (cached) return res.json(cached);

      const peersResult = await callFinanceTool("finance_company_peers", {
        ticker_symbol: ticker,
        query: "peers",
        action: "Finding peers",
      });

      // Extract peer symbols from the markdown
      const peerRows = parseMarkdownTable(peersResult.content);
      let peerSymbols: string[] = [];

      if (peerRows.length > 0) {
        // Try to extract symbols from parsed table
        peerSymbols = peerRows
          .map(
            (r) =>
              (r["symbol"] as string) ??
              (r["Symbol"] as string) ??
              (r["ticker"] as string) ??
              (r["Ticker"] as string) ??
              "",
          )
          .filter(Boolean);
      }

      // If table parsing didn't find symbols, try extracting them from raw text
      if (peerSymbols.length === 0) {
        const symbolRegex = /\b([A-Z]{1,5})\b/g;
        let m: RegExpExecArray | null;
        const candidates = new Set<string>();
        while ((m = symbolRegex.exec(peersResult.content)) !== null) {
          // Filter out common markdown/noise words
          const word = m[1];
          if (!["THE", "AND", "FOR", "ARE", "NOT", "CEO", "EPS", "TTM", "USD", "NYSE", "NASDAQ"].includes(word)) {
            candidates.add(word);
          }
        }
        peerSymbols = Array.from(candidates).slice(0, 10);
      }

      // Remove the original ticker and limit
      peerSymbols = peerSymbols
        .filter((s) => s !== ticker)
        .slice(0, 8);

      if (peerSymbols.length === 0) {
        setCache(cacheKey, []);
        return res.json([]);
      }

      // Fetch quotes for all peers
      const quotesResult = await callFinanceTool("finance_quotes", {
        ticker_symbols: peerSymbols,
        fields: [
          "price",
          "change",
          "changesPercentage",
          "marketCap",
          "pe",
          "eps",
          "volume",
        ],
      });

      const quoteRows = parseMarkdownTable(quotesResult.content);
      const peers = quoteRows.map((row) => ({
        symbol:
          (row["symbol"] as string) ??
          (row["Symbol"] as string) ??
          "",
        name:
          (row["name"] as string) ??
          (row["Name"] as string) ??
          (row["symbol"] as string) ??
          "",
        marketCap: toNumber(row["marketCap"] ?? row["Market Cap"]),
        price: toNumber(row["price"] ?? row["Price"]),
        change1d: toNumber(
          row["changesPercentage"] ?? row["change"] ?? row["Change"],
        ),
        change1m: 0,
        revenueGrowth: 0,
        epsGrowth: 0,
        pe: toNumber(row["pe"] ?? row["PE"] ?? row["P/E"]),
        roe: 0,
        dividendYield: 0,
      }));

      setCache(cacheKey, peers);
      res.json(peers);
    } catch (err: unknown) {
      console.error("peers error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 6. Financials
  // -----------------------------------------------------------------------
  app.get("/api/financials/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `financials:${ticker}`;
      const cached = getCached<Record<string, unknown>>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_financials", {
        ticker_symbols: [ticker],
        period: "annual",
        limit: 4,
        income_statement_metrics: [
          "revenue",
          "grossProfit",
          "operatingIncome",
          "netIncome",
          "eps",
          "ebitda",
          "ebitdaRatio",
        ],
        balance_sheet_metrics: [
          "totalDebt",
          "totalStockholdersEquity",
          "cashAndCashEquivalents",
          "totalCurrentAssets",
          "totalCurrentLiabilities",
          "totalAssets",
          "totalLiabilities",
          "shortTermDebt",
          "longTermDebt",
          "totalNonCurrentLiabilities",
        ],
        cash_flow_metrics: ["freeCashFlow"],
      });

      // The response may contain multiple tables, one per statement type
      const content = result.content;

      // Split content into sections by headings or double newlines
      const sections = content.split(/\n(?=#+\s|.*Income|.*Balance|.*Cash)/i);

      const allRows = parseMarkdownTable(content);

      // Try to categorize rows by presence of known fields
      const incomeStatement: Record<string, unknown>[] = [];
      const balanceSheet: Record<string, unknown>[] = [];
      const cashFlow: Record<string, unknown>[] = [];

      // If there are section-specific tables, parse them separately
      let incomeSection = "";
      let balanceSection = "";
      let cashSection = "";

      for (const section of sections) {
        const lower = section.toLowerCase();
        if (lower.includes("income") || lower.includes("revenue")) {
          incomeSection += section + "\n";
        } else if (
          lower.includes("balance") ||
          lower.includes("debt") ||
          lower.includes("asset")
        ) {
          balanceSection += section + "\n";
        } else if (lower.includes("cash") || lower.includes("flow")) {
          cashSection += section + "\n";
        }
      }

      const incomeRows =
        incomeSection.length > 0
          ? parseMarkdownTable(incomeSection)
          : [];
      const balanceRows =
        balanceSection.length > 0
          ? parseMarkdownTable(balanceSection)
          : [];
      const cashRows =
        cashSection.length > 0 ? parseMarkdownTable(cashSection) : [];

      const financials = {
        incomeStatement:
          incomeRows.length > 0 ? incomeRows : allRows.length > 0 ? allRows : [],
        balanceSheet: balanceRows,
        cashFlow: cashRows,
      };

      setCache(cacheKey, financials);
      res.json(financials);
    } catch (err: unknown) {
      console.error("financials error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 7. Holdings
  // -----------------------------------------------------------------------
  app.get("/api/holdings/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `holdings:${ticker}`;
      const cached = getCached<Record<string, unknown>>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_holdings", {
        ticker_symbols: [ticker],
        ticker_names: [ticker],
        query: "holders",
        holdings_types: ["institutional_holders", "insider_transactions"],
        insider_transactions_months_lookback: 6,
      });

      const content = result.content;

      // Split by sections for institutional vs insider
      const institutionalSection =
        content.split(/insider/i)[0] ?? content;
      const insiderSection =
        content.split(/insider/i).slice(1).join("insider") ?? "";

      const institutionalRows = parseMarkdownTable(institutionalSection);
      const insiderRows = parseMarkdownTable(
        insiderSection.length > 0 ? insiderSection : "",
      );

      const institutionalHolders = institutionalRows.map((row) => ({
        name:
          (row["name"] as string) ??
          (row["Name"] as string) ??
          (row["Holder"] as string) ??
          "",
        shares: toNumber(row["shares"] ?? row["Shares"]),
        value: toNumber(row["value"] ?? row["Value"]),
        percentage: toNumber(
          row["percentage"] ?? row["Percentage"] ?? row["%"] ?? row["Weight"],
        ),
        source: "SEC Filing",
      }));

      const insiderTransactions = insiderRows.map((row) => ({
        name:
          (row["name"] as string) ??
          (row["Name"] as string) ??
          (row["Insider"] as string) ??
          "",
        title:
          (row["title"] as string) ??
          (row["Title"] as string) ??
          (row["Position"] as string) ??
          "",
        date:
          (row["date"] as string) ??
          (row["Date"] as string) ??
          "",
        shares: toNumber(row["shares"] ?? row["Shares"]),
        price: toNumber(row["price"] ?? row["Price"]),
        type:
          (row["type"] as string) ??
          (row["Type"] as string) ??
          (row["Transaction"] as string) ??
          "",
      }));

      const holdings = { institutionalHolders, insiderTransactions };
      setCache(cacheKey, holdings);
      res.json(holdings);
    } catch (err: unknown) {
      console.error("holdings error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 8. Estimates
  // -----------------------------------------------------------------------
  app.get("/api/estimates/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `estimates:${ticker}`;
      const cached = getCached<unknown[]>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_estimates", {
        ticker_symbols: [ticker],
      });

      const rows = parseMarkdownTable(result.content);
      const estimates = rows.map((row) => ({
        date:
          (row["date"] as string) ??
          (row["Date"] as string) ??
          (row["Period"] as string) ??
          "",
        pe: toNumber(row["pe"] ?? row["PE"] ?? row["P/E"]),
        estPe: toNumber(
          row["estPe"] ?? row["Est PE"] ?? row["Estimated PE"],
        ),
        t12mEps: toNumber(
          row["t12mEps"] ?? row["T12M EPS"] ?? row["TTM EPS"],
        ),
        estEps: toNumber(
          row["estEps"] ?? row["Est EPS"] ?? row["Estimated EPS"],
        ),
        estPeg: toNumber(row["estPeg"] ?? row["Est PEG"] ?? row["PEG"]) || null,
      }));

      setCache(cacheKey, estimates);
      res.json(estimates);
    } catch (err: unknown) {
      console.error("estimates error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 9. Analyst research
  // -----------------------------------------------------------------------
  app.get("/api/analyst/:ticker", async (req: Request, res: Response) => {
    try {
      const ticker = (req.params.ticker as string).toUpperCase();
      const cacheKey = `analyst:${ticker}`;
      const cached = getCached<unknown>(cacheKey);
      if (cached) return res.json(cached);

      const result = await callFinanceTool("finance_analyst_research", {
        ticker_symbols: [ticker],
      });

      const rows = parseMarkdownTable(result.content);

      // Return both the parsed rows and the raw content for the frontend to use
      const data = {
        ratings: rows,
        raw: result.content,
      };

      setCache(cacheKey, data);
      res.json(data);
    } catch (err: unknown) {
      console.error("analyst error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // -----------------------------------------------------------------------
  // 10. Ticker tape (major market movers)
  // -----------------------------------------------------------------------
  app.get("/api/ticker-tape", async (_req: Request, res: Response) => {
    try {
      const cacheKey = "ticker-tape";
      const cached = getCached<unknown[]>(cacheKey);
      if (cached) return res.json(cached);

      const majorTickers = [
        "SPY",
        "QQQ",
        "AAPL",
        "MSFT",
        "NVDA",
        "AMZN",
        "META",
        "TSLA",
        "GOOGL",
        "JPM",
      ];

      const result = await callFinanceTool("finance_quotes", {
        ticker_symbols: majorTickers,
        fields: ["price", "change", "changesPercentage"],
      });

      const rows = parseMarkdownTable(result.content);
      const tape = rows
        .map((row) => ({
          symbol:
            (row["symbol"] as string) ??
            (row["Symbol"] as string) ??
            "",
          price: toNumber(row["price"] ?? row["Price"]),
          change: toNumber(row["change"] ?? row["Change"]),
          pct: toNumber(
            row["changesPercentage"] ??
              row["Change %"] ??
              row["changespercentage"],
          ),
        }))
        .filter((t) => t.symbol && t.symbol !== "symbol" && t.price > 0);

      setCache(cacheKey, tape);
      res.json(tape);
    } catch (err: unknown) {
      console.error("ticker-tape error:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  });
}
