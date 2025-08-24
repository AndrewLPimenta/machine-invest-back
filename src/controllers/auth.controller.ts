import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta";

const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ status: "error", message: "E-mail e senha são obrigatórios" });
    }

    // 1️⃣ Busca usuário
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "E-mail não encontrado" });
    }

    // 2️⃣ Verifica senha
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ status: "error", message: "Senha incorreta" });
    }

    // 3️⃣ Checa respostas
    const respostas = await prisma.respostaUsuario.findMany({
      where: { idUsuario: user.id },
    });

    // 4️⃣ Busca resultado e perfil
    const resultado = await prisma.resultadoUsuario.findUnique({
      where: { idUsuario: user.id },
      include: { perfil: true }, // PerfilInvestidor
    });

    const respondeu = respostas.length > 0;
    const perfil = resultado?.perfil.nomePerfil || null;

    // 5️⃣ Gera token
    const token = generateToken(user.id);

    return res.status(200).json({
      status: "success",
      message: "Login realizado com sucesso",
      data: {
        user: { id: user.id, nome: user.nome, email: user.email },
        token,
        respondeu,
        perfil,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Erro ao realizar login" });
  }
};
