import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tips = [
  { texto: "Nunca deixe seu dinheiro somente na conta corrente, lá ele não rende juros!", perfil: "conservador" },
  { texto: "Diversifique entre renda fixa e multimercado.", perfil: "moderado" },
  { texto: "Invista em ações de empresas sólidas no longo prazo.", perfil: "arrojado" },
];

// ==============================
// RETORNA TODAS AS DICAS
// ==============================
export const getTips = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ status: "error", message: "Usuário não autenticado" });

    const resultado = await prisma.resultadoUsuario.findUnique({
      where: { idUsuario: userId },
      include: { perfil: true },
    });

    console.log("Resultado do usuário:", resultado);

    if (!resultado) {
      return res.status(404).json({ status: "error", message: "Resultado do usuário não encontrado" });
    }

    if (!resultado.perfil || !resultado.perfil.nomePerfil) {
      return res.status(500).json({ status: "error", message: "Perfil do usuário não encontrado" });
    }

    const perfilNome = resultado.perfil.nomePerfil.toLowerCase();
    const filtered = tips.filter((t) => t.perfil === perfilNome);

    if (filtered.length === 0) {
      return res.status(404).json({ status: "error", message: "Nenhuma dica encontrada para o perfil do usuário" });
    }

    return res.status(200).json({ status: "success", data: { dicas: filtered } });
  } catch (err) {
    console.error("Erro em getTips:", err);
    return res.status(500).json({ status: "error", message: "Erro ao buscar dicas" });
  }
};

// ==============================
// RETORNA UMA DICA ALEATÓRIA
// ==============================
export const getRandomTip = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ status: "error", message: "Usuário não autenticado" });

    const resultado = await prisma.resultadoUsuario.findUnique({
      where: { idUsuario: userId },
      include: { perfil: true },
    });

    console.log("Resultado do usuário:", resultado);

    if (!resultado) {
      return res.status(404).json({ status: "error", message: "Resultado do usuário não encontrado" });
    }

    if (!resultado.perfil || !resultado.perfil.nomePerfil) {
      return res.status(500).json({ status: "error", message: "Perfil do usuário não encontrado" });
    }

    const perfilNome = resultado.perfil.nomePerfil.toLowerCase();
    const pool = tips.filter((t) => t.perfil === perfilNome);

    if (pool.length === 0) {
      return res.status(404).json({ status: "error", message: "Nenhuma dica encontrada para o perfil do usuário" });
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    return res.status(200).json({ status: "success", data: { dica: random } });
  } catch (err) {
    console.error("Erro em getRandomTip:", err);
    return res.status(500).json({ status: "error", message: "Erro ao buscar dica aleatória" });
  }
};
