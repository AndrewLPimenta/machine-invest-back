import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// Buscar perfil do usuário
export const getPerfilUsuario = async (req: Request, res: Response) => {
  try {
    const { idUsuario } = req.params;

    const resultado = await prisma.resultadoUsuario.findFirst({
      where: { idUsuario: Number(idUsuario) },
      include: { perfil: true },
    });

    if (!resultado) {
      return res.status(404).json({ error: "Resultado não encontrado" });
    }

    // Buscar todas as perguntas para calcular pontuação máxima
    const perguntas = await prisma.pergunta.findMany({ include: { opcoes: true } });
    const pontuacaoMaxima: number = perguntas.reduce(
      (sum: number, p: { opcoes: { pontuacao: number }[] }) => {
        const maxOpcao: number = Math.max(...p.opcoes.map((o: { pontuacao: number }) => o.pontuacao));
        return sum + maxOpcao;
      },
      0
    );

    const percentual: number = (resultado.pontuacaoTotal / pontuacaoMaxima) * 100;

    res.json({
      perfil: resultado.perfil,
      pontuacao: resultado.pontuacaoTotal,
      percentual: Math.round(percentual),
      dataClassificacao: resultado.dataClassificacao,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
};

// Calcular perfil do usuário
export const calcularPerfil = async (req: Request, res: Response) => {
  try {
    const { idUsuario } = req.body as { idUsuario: number };

    if (!idUsuario) {
      return res.status(400).json({ error: "idUsuario é obrigatório" });
    }

    // Buscar respostas do usuário com opções selecionadas
    const respostas = await prisma.respostaUsuario.findMany({
      where: { idUsuario },
      include: { opcao: true },
    });

    if (respostas.length === 0) {
      return res.status(400).json({ error: "Usuário não possui respostas" });
    }

    // Somar pontuação total
    const totalPontuacao: number = respostas.reduce(
      (sum: number, r: { opcao?: { pontuacao: number } }) => sum + (r.opcao?.pontuacao ?? 0),
      0
    );

    // Buscar todas as perguntas para calcular pontuação máxima real
    const perguntas = await prisma.pergunta.findMany({ include: { opcoes: true } });
    const pontuacaoMaxima: number = perguntas.reduce((sum: number, p: { opcoes: { pontuacao: number }[] }) => {
      const maxOpcao = Math.max(...p.opcoes.map(o => o.pontuacao));
      return sum + maxOpcao;
    }, 0);

    // Percentual baseado na pontuação máxima real
    const percentual: number = (totalPontuacao / pontuacaoMaxima) * 100;

    // Determinar perfil com limites ajustados
    let idPerfil: number;
    if (percentual <= 46) idPerfil = 1;      // Conservador
    else if (percentual <= 70) idPerfil = 2; // Moderado
    else idPerfil = 3;                        // Agressivo

    // Upsert resultado do usuário
    await prisma.resultadoUsuario.upsert({
      where: { idUsuario },
      update: {
        idPerfil,
        pontuacaoTotal: totalPontuacao,
        dataClassificacao: new Date(),
      },
      create: {
        idUsuario,
        idPerfil,
        pontuacaoTotal: totalPontuacao,
        dataClassificacao: new Date(),
      },
    });

    res.json({
      message: "Perfil calculado com sucesso",
      perfilId: idPerfil,
      pontuacao: totalPontuacao,
      percentual: Math.round(percentual),
    });
  } catch (error) {
    console.error("Erro ao calcular perfil:", error);
    res.status(500).json({ error: "Erro ao calcular perfil" });
  }
};
