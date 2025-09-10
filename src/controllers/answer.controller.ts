import { Request, Response } from "express";
import { prisma } from "../prisma/client";

type RespostaInput = {
  idPergunta: number;
  idOpcao: number;
};

export const salvarRespostas = async (req: Request, res: Response) => {
  try {
    const { idUsuario, respostas } = req.body as { idUsuario: number; respostas: RespostaInput[] };

    if (!idUsuario || !respostas || !Array.isArray(respostas)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { id: idUsuario } });
    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await prisma.respostaUsuario.deleteMany({ where: { idUsuario } });

    const respostasCriadas = await Promise.all(
      respostas.map((resp) =>
        prisma.respostaUsuario.create({
          data: {
            idUsuario,
            idPergunta: resp.idPergunta,
            idOpcao: resp.idOpcao,
          },
        }),
      ),
    );

    const totalPontuacao = await prisma.opcao.aggregate({
      _sum: { pontuacao: true },
      where: { id: { in: respostas.map(r => r.idOpcao) } },
    });

    const pontuacaoTotal = totalPontuacao._sum.pontuacao ?? 0;

    let perfilId: number;
    if (pontuacaoTotal <= 10) perfilId = 1; 
    else if (pontuacaoTotal <= 20) perfilId = 2;
    else perfilId = 3; 

    await prisma.resultadoUsuario.upsert({
      where: { idUsuario },
      update: {
        idPerfil: perfilId,
        pontuacaoTotal,
        dataClassificacao: new Date(),
      },
      create: {
        idUsuario,
        idPerfil: perfilId,
        pontuacaoTotal,
        dataClassificacao: new Date(),
      },
    });

    res.status(201).json({ message: "Respostas salvas e perfil calculado", perfilId, pontuacaoTotal });
  } catch (error) {
    console.error("Erro no salvarRespostas:", error);
    res.status(500).json({ error: "Erro ao salvar respostas e calcular perfil" });
  }
};
