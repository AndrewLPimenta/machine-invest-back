import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const calcularPerfil = async (req: Request, res: Response) => {
  try {
    const { idUsuario } = req.body;

    if (!idUsuario) {
      return res.status(400).json({ error: "idUsuario é obrigatório" });
    }

    const respostas = await prisma.respostaUsuario.findMany({
      where: { idUsuario },
      include: { opcao: true },
    });

    if (respostas.length === 0) {
      return res.status(400).json({ error: "Usuário não possui respostas" });
    }

    const totalPontuacao = respostas.reduce(
      (sum: number, r: { opcao: { pontuacao: number } }) => sum + r.opcao.pontuacao,
      0
    );
    
    let idPerfil: number;
    if (totalPontuacao <= 10) idPerfil = 1; 
    else if (totalPontuacao <= 20) idPerfil = 2; 
    else idPerfil = 3; 

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
        },
      });
    }


    res.json({ message: "Perfil calculado", perfilId: idPerfil, pontuacao: totalPontuacao });
  } catch (error) {
    res.status(500).json({ error: "Erro ao calcular perfil" });
  }
};

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

    res.json({ perfil: resultado.perfil, pontuacao: resultado.pontuacaoTotal });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
};
