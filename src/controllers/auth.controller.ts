import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const newUser = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
      },
    });

    res.status(201).json({ message: "Usuário criado com sucesso", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    // Aqui você pode gerar um token JWT para autenticação futura (não incluído por enquanto)

    res.status(200).json({ message: "Login realizado com sucesso", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login" });
  }
};
