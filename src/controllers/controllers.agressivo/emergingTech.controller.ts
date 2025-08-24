import { Request, Response } from "express";
import axios from "axios";

// Suas chaves de API
const ALPHAVANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const FINNHUB_KEY = process.env.FINNHUB_KEY;
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_KEY;

// Tipagens de retorno das APIs externas
interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string;
    "05. price": string;
    "08. previous close": string;
  };
}

interface FinnhubQuote {
  c: number;  // preço atual (current)
  pc: number; // fechamento anterior (previous close)
}

interface TwelveDataPrice {
  price: string;
}

// Tipagens internas da aplicação
type StockSource = {
  price: number | null;
  previousClose: number | null;
  changePercent: number | null;
  error?: string;
};

type StockData = {
  ticker: string;
  alphaVantage?: StockSource;
  finnhub?: StockSource;
  twelveData?: StockSource;
};

type StocksResponse = Record<string, StockData>;

// Controller
export const getEmergingTechStocks = async (req: Request, res: Response) => {
  // Suporta query string ou body
  const tickersParam = req.query.tickers as string | undefined;
  const tickersBody = req.body?.tickers as string[] | undefined;
  const tickers = tickersBody || (tickersParam ? tickersParam.split(",") : []);

  if (!tickers || tickers.length === 0) {
    return res.status(400).json({
      error: "Forneça pelo menos um ticker (ex: ?tickers=AAPL,TSLA)"
    });
  }

  try {
    const results: StocksResponse = {};

    for (const ticker of tickers) {
      const stockData: StockData = { ticker };

      // --- Alpha Vantage ---
      try {
        const alphaUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHAVANTAGE_KEY}`;
        const alphaResp = await axios.get<AlphaVantageQuote>(alphaUrl);
        const quote = alphaResp.data["Global Quote"];

        const price = parseFloat(quote?.["05. price"]) || null;
        const prevClose = parseFloat(quote?.["08. previous close"]) || null;

        stockData.alphaVantage = {
          price,
          previousClose: prevClose,
          changePercent:
            price !== null && prevClose !== null
              ? ((price - prevClose) / prevClose) * 100
              : null
        };
      } catch {
        stockData.alphaVantage = {
          price: null,
          previousClose: null,
          changePercent: null,
          error: "Falha no Alpha Vantage"
        };
      }

      // --- Finnhub ---
      try {
        const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const finnhubResp = await axios.get<FinnhubQuote>(finnhubUrl);
        const { c: current, pc: prevClose } = finnhubResp.data;

        stockData.finnhub = {
          price: current ?? null,
          previousClose: prevClose ?? null,
          changePercent:
            current !== null && prevClose !== null
              ? ((current - prevClose) / prevClose) * 100
              : null
        };
      } catch {
        stockData.finnhub = {
          price: null,
          previousClose: null,
          changePercent: null,
          error: "Falha no Finnhub"
        };
      }

      // --- Twelve Data ---
      try {
        const twelveUrl = `https://api.twelvedata.com/price?symbol=${ticker}&apikey=${TWELVE_DATA_KEY}`;
        const twelveResp = await axios.get<TwelveDataPrice>(twelveUrl);
        const price = parseFloat(twelveResp.data.price) || null;

        stockData.twelveData = {
          price,
          previousClose: null,
          changePercent: null
        };
      } catch {
        stockData.twelveData = {
          price: null,
          previousClose: null,
          changePercent: null,
          error: "Falha no Twelve Data"
        };
      }

      results[ticker] = stockData;
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados das ações." });
  }
};
