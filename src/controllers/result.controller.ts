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

    const totalPerguntas = await prisma.pergunta.count();
    const percentual = Math.round((resultado.pontuacaoTotal / (totalPerguntas * 3)) * 100);

    res.json({
      perfil: resultado.perfil,
      pontuacao: resultado.pontuacaoTotal,
      percentual,
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
    const { idUsuario } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ error: "idUsuario é obrigatório" });
    }

    // Buscar total de perguntas do formulário
    const totalPerguntas = await prisma.pergunta.count();

    // Buscar respostas do usuário
    const respostas = await prisma.respostaUsuario.findMany({
      where: { idUsuario },
      include: { opcao: true },
    });

    if (respostas.length === 0) {
      return res.status(400).json({ error: "Usuário não possui respostas" });
    }

    if (respostas.length < totalPerguntas) {
      return res.status(400).json({
        error: `Faltam respostas. Você respondeu ${respostas.length} de ${totalPerguntas} perguntas.`,
      });
    }

    // Somar pontuação total garantindo que seja numérica
    const totalPontuacao = respostas.reduce((sum, r) => {
      const pontuacao = Number(r.opcao?.pontuacao ?? 0);
      return sum + pontuacao;
    }, 0);

    // Calcular percentual
    const pontuacaoMaxima = totalPerguntas * 3;
    const percentual = (totalPontuacao / pontuacaoMaxima) * 100;

    // Determinar perfil baseado no percentual
    let idPerfil: number;
    if (percentual <= 47) idPerfil = 1;      // Conservador
    else if (percentual <= 73) idPerfil = 2; // Moderado
    else idPerfil = 3;                        // Agressivo

    // Criar ou atualizar resultado do usuário
    const resultadoExistente = await prisma.resultadoUsuario.findFirst({
      where: { idUsuario },
    });

    if (resultadoExistente) {
      await prisma.resultadoUsuario.update({
        where: { id: resultadoExistente.id },
        data: {
          idPerfil,
          pontuacaoTotal: totalPontuacao,
          dataClassificacao: new Date(),
        },
      });
    } else {
      await prisma.resultadoUsuario.create({
        data: {
          idUsuario,
          idPerfil,
          pontuacaoTotal: totalPontuacao,
          dataClassificacao: new Date(),
        },
      });
    }

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
