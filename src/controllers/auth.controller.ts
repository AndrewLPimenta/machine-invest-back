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

    // Verificando se as senhas coincidem
    if (senha !== confirmarSenha) {
      return res.status(400).json({ status: "error", message: "As senhas não coincidem" });
    }

    // Verificando a complexidade da senha
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!senhaRegex.test(senha)) {
      return res.status(400).json({ status: "error", message: "A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos" });
    }

    // Verificando se o e-mail já está cadastrado
    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ status: "error", message: "Email já cadastrado" });
    }

    // Criptografando a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criando o novo usuário no banco de dados
    const newUser = await prisma.usuario.create({
      data: { nome, email, senhaHash },
    });

    // Gerando o token JWT
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

    // Verificando se o e-mail e senha foram fornecidos
    if (!email || !senha) {
      return res.status(400).json({ status: "error", message: "E-mail e senha são obrigatórios" });
    }

    // Buscando o usuário no banco de dados
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ status: "error", message: "E-mail não encontrado" });
    }

    // Verificando se a senha está correta
    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ status: "error", message: "Senha incorreta" });
    }

    // Checando se o usuário respondeu ao questionário (respostas)
    const respostas = await prisma.respostaUsuario.findMany({
      where: { idUsuario: user.id },
    });

    // Buscando o perfil do usuário
    const resultado = await prisma.resultadoUsuario.findUnique({
      where: { idUsuario: user.id },
      include: { perfil: true }, // Incluindo as informações do perfil
    });

    const respondeu = respostas.length > 0;
    const perfil = resultado?.perfil.nomePerfil || null;

    // Gerando o token JWT
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