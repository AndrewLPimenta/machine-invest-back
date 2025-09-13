import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const tips = [

    //conservador
    {texto: "Nunca deixe seu dinheiro somente na conta corrente, lá ele não rende juros!", perfil: 'conservador'},

    //moderado
    {texto: 'diversifique entre renda fixa e multimercado.', perfil: 'moderado'},

    //arrojado
    {texto: 'invista em ações de empresas sólidas no longo prazo.', perfil: 'arrojado'},
]

export const getTips = async (req: Request, res: Response) => {
  try {
    const idUsuario = parseInt(req.query.idUsuario as string);
    if (!idUsuario) return res.status(400).json({ message: "idUsuario é obrigatório" });

    const resultado = await prisma.resultadoUsuario.findUnique({
      where: { idUsuario },
      include: { perfil: true },
    });

    if (!resultado) return res.status(404).json({ message: "Resultado do usuário não encontrado" });

    const perfilNome = resultado.perfil.nomePerfil.toLowerCase(); // conservador, moderado ou agressivo
    const filtered = tips.filter(t => t.perfil === perfilNome);

    res.json({ dicas: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar dicas" });
  }
};

export const getRandomTip = async (req: Request, res: Response) => {
  try {
    const idUsuario = parseInt(req.query.idUsuario as string);
    if (!idUsuario) return res.status(400).json({ message: "idUsuario é obrigatório" });

    const resultado = await prisma.resultadoUsuario.findUnique({
      where: { idUsuario },
      include: { perfil: true },
    });

    if (!resultado) return res.status(404).json({ message: "Resultado do usuário não encontrado" });

    const perfilNome = resultado.perfil.nomePerfil.toLowerCase();
    const pool = tips.filter(t => t.perfil === perfilNome);

    if (pool.length === 0) return res.status(404).json({ message: "Nenhuma dica encontrada" });

    const random = pool[Math.floor(Math.random() * pool.length)];
    res.json({ dica: random });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar dica aleatória" });
  }
};