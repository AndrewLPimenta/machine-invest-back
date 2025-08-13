import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getUsuario = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        resultados: {
          include: {
            perfil: true // já traz nome e descrição do perfil
          }
        },
        respostas: {
          include: {
            pergunta: true,
            opcao: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};
