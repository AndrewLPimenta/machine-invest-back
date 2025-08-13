// controllers/auth.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta";

const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    // Verifica se as senhas coincidem
    if (senha !== confirmarSenha) {
      return res.status(400).json({ status: "error", message: "As senhas não coincidem" });
    }

    // Verifica se já existe usuário com o mesmo e-mail
    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ status: "error", message: "Email já cadastrado" });
    }

    // Gera hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria usuário no banco
    const newUser = await prisma.usuario.create({
      data: { nome, email, senhaHash },
    });

    // Gera token JWT
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    // Busca usuário pelo e-mail
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ status: "error", message: "Credenciais inválidas" });
    }

    // Confere se a senha é válida
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return res.status(400).json({ status: "error", message: "Credenciais inválidas" });
    }

    // Gera token JWT
    const token = generateToken(user.id);

    return res.status(200).json({
      status: "success",
      message: "Login realizado com sucesso",
      data: {
        user: { id: user.id, nome: user.nome, email: user.email },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Erro ao realizar login" });
  }
};
