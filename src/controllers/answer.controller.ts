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

    // Verifica se o usuário existe
    const usuarioExiste = await prisma.usuario.findUnique({ where: { id: idUsuario } });
    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Deleta respostas antigas
    await prisma.respostaUsuario.deleteMany({ where: { idUsuario } });

    // Salva respostas novas
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

    // Soma pontuações
    const totalPontuacao = await prisma.opcao.aggregate({
      _sum: { pontuacao: true },
      where: { id: { in: respostas.map(r => r.idOpcao) } },
    });

    const pontuacaoTotal = totalPontuacao._sum.pontuacao ?? 0;

    // Define perfil baseado na pontuação
    let perfilId: number;
    if (pontuacaoTotal <= 10) perfilId = 1; // Conservador
    else if (pontuacaoTotal <= 20) perfilId = 2; // Moderado
    else perfilId = 3; // Agressivo

    // Upsert resultado
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
