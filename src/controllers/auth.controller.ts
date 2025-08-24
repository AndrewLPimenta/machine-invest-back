// controllers/auth.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta";

const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

// REGISTRO DE USUÁRIO
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
      return res.status(400).json({ status: "error", message: "As senhas não coincidem" });
    }

    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ status: "error", message: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const newUser = await prisma.usuario.create({
      data: { nome, email, senhaHash },
    });

    const token = generateToken(newUser.id);

    return res.status(201).json({
      status: "success",
      message: "Usuário criado com sucesso",
      userId: newUser.id,
      token,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Erro ao criar usuário" });
  }
};

// LOGIN DE USUÁRIO
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ status: "error", message: "E-mail e senha são obrigatórios" });
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        respostas: true,
        resultados: {
          include: { perfil: true },
          orderBy: { dataClassificacao: "desc" }, // pega o mais recente
          take: 1, // retorna só 1 resultado
        },
      },
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "E-mail não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ status: "error", message: "Senha incorreta" });
    }

    const token = generateToken(user.id);

    // Checar se já respondeu
    const respondeu = user.respostas.length > 0;
    const perfil = user.resultados[0]?.perfil?.nomePerfil || null;

    return res.status(200).json({
      status: "success",
      message: "Login realizado com sucesso",
      data: {
        user: { id: user.id, nome: user.nome, email: user.email },
        token,
        respondeu, // 👈 flag se já respondeu
        perfil,    // 👈 nome do perfil mais recente
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Erro ao realizar login" });
  }
};
