import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getFormulario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const formulario = await prisma.formulario.findUnique({
      where: { id: Number(id) },
      include: {
        perguntas: {
          include: { opcoes: true },
        },
      },
    });

    if (!formulario) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    res.json(formulario);
  } catch (error) {
    console.error('Erro no getFormulario:', error);
    res.status(500).json({ error: "Erro ao buscar formulário" });
  }
};
