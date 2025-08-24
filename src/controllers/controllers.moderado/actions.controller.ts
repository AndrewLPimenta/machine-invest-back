import { Request, Response } from "express";
import axios from "axios";

interface Acao {
  ticker: string;
  nome: string;
  precoAtual: number | null;
  moeda: string | null;
}

// Tipagem da API do Yahoo Finance
interface YahooFinanceChart {
  chart: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        currency?: string;
      };
    }>;
    error?: any;
  };
}

const tickers = [
  { ticker: "ITSA4.SA", nome: "Itaúsa" },
  { ticker: "TAEE11.SA", nome: "Taesa" },
  { ticker: "BBAS3.SA", nome: "Banco do Brasil" },
  { ticker: "PETR4.SA", nome: "Petrobras PN" },
  { ticker: "ABEV3.SA", nome: "Ambev" },
  { ticker: "VALE3.SA", nome: "Vale" },
  { ticker: "WEGE3.SA", nome: "Weg" },
  { ticker: "BBDC3.SA", nome: "Bradesco ON" },
  { ticker: "BBDC4.SA", nome: "Bradesco PN" },
  { ticker: "MGLU3.SA", nome: "Magazine Luiza" },
  { ticker: "LREN3.SA", nome: "Lojas Renner" },
  { ticker: "CIEL3.SA", nome: "Cielo" },
  { ticker: "GGBR4.SA", nome: "Gerdau PN" },
  { ticker: "USIM5.SA", nome: "Usiminas PNA" },
  { ticker: "EMBR3.SA", nome: "Embraer" },
  { ticker: "CSAN3.SA", nome: "Cosan" },
  { ticker: "JBSS3.SA", nome: "JBS ON" },
];

export const AcoesMercado = async (req: Request, res: Response) => {
  try {
    const results = await Promise.allSettled(
      tickers.map(async (t) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${t.ticker}`;
        const resp = await axios.get<YahooFinanceChart>(url);
        const result = resp.data.chart.result?.[0];

        return {
          ticker: t.ticker.replace(".SA", ""),
          nome: t.nome,
          precoAtual: result?.meta?.regularMarketPrice ?? null,
          moeda: result?.meta?.currency ?? null,
        } as Acao;
      })
    );

    const acoes = results
      .filter(r => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<Acao>).value);

    results
      .filter(r => r.status === "rejected")
      .forEach((r, i) => {
        console.warn(`Ticker falhou: ${tickers[i].ticker}`, (r as PromiseRejectedResult).reason);
      });

    return res.json({ acoes });
  } catch (err) {
    console.error("Erro inesperado ao buscar ações:", err);
    return res.status(500).json({ error: "Erro ao buscar dados do Yahoo Finance" });
  }
};
