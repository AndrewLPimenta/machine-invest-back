import { Request, Response } from "express";
import axios from "axios";

interface Acao {
  ticker: string;
  nome: string;
  precoAtual: number | null;
  moeda: string | null;
}

const tickers = [
  { ticker: "ITSA4.SA", nome: "Itaúsa" },
  { ticker: "TAEE11.SA", nome: "Taesa" },
  { ticker: "BBAS3.SA", nome: "Banco do Brasil" },
  { ticker: "PETR4.SA", nome: "Petrobras PN" },
  { ticker: "ABEV3.SA", nome: "Ambev" },
];

export const AcoesMercado = async (req: Request, res: Response) => {
  try {
    const promises = tickers.map(async (t) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${t.ticker}`;
      const resp = await axios.get(url);
      const result = resp.data.chart.result?.[0];

      const precoAtual =
        result?.meta?.regularMarketPrice ?? null;
      const moeda =
        result?.meta?.currency ?? null;

      const acao: Acao = {
        ticker: t.ticker.replace(".SA", ""),
        nome: t.nome,
        precoAtual,
        moeda,
      };
      return acao;
    });
678
 
    const acoes = await Promise.all(promises);

    return res.json({ acoes });
  } catch (err) {
    console.error("Erro ao buscar ações:", err);
    return res
      .status(500)
      .json({ error: "Erro ao buscar dados do Yahoo Finance" });
  }
};
