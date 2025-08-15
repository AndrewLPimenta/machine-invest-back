import axios from "axios";
import { Request, Response } from "express";

export async function getCotacao(req: Request, res: Response) {
  try {
    const { symbols, convert } = req.query;

    if (!symbols || !convert) {
      return res.status(400).json({ error: "Parâmetros 'symbols' e 'convert' são obrigatórios" });
    }

    const symbolList = (symbols as string)
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    const convertCurrency = (convert as string).trim().toUpperCase();

    const resultados: any[] = [];

    for (const symbol of symbolList) {
      try {
        const pair = `${symbol}${convertCurrency}`;
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        resultados.push({ symbol, price: response.data.price });
      } catch {
        resultados.push({ symbol, error: `Par ${symbol}/${convertCurrency} não disponível` });
      }
    }

    return res.json(resultados);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar cotações" });
  }
}
