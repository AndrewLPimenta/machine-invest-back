import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getTipos = async (req: Request, res: Response) => {
  try {
    // Se quiser buscar todos:
    const tipos = await prisma.perfilInvestidor.findMany();
    res.json(tipos);
  } catch (error) {
    console.error("Erro ao buscar tipos:", error);
    res.status(500).json({ error: "Erro ao buscar tipos" });
  }
};
