// src/controllers/tesouro.controller.ts
import { Request, Response } from "express";

interface TituloConservador {
  nome: string;
  vencimento: string;
  rentabilidade: number;
  precoUnitario: number;
}

export const fetchTesouro = async (req: Request, res: Response) => {
  try {
    
    const titulos: TituloConservador[] = [
      {
        nome: "Tesouro Selic 2027",
        vencimento: "01/05/2027",
        rentabilidade: 13.15,
        precoUnitario: 102.34,
      },
      {
        nome: "Tesouro Prefixado 2029",
        vencimento: "01/01/2029",
        rentabilidade: 10.50,
        precoUnitario: 98.76,
      },
      {
        nome: "Tesouro IPCA+ 2035",
        vencimento: "15/08/2035",
        rentabilidade: 5.85,
        precoUnitario: 112.50,
      },
    ];

    return res.json({ titulos });
  } catch (err) {
    console.error("Erro ao buscar Tesouro Direto:", err);
    return res
      .status(500)
      .json({ error: "Erro ao buscar dados do Tesouro Direto" });
  }
};
