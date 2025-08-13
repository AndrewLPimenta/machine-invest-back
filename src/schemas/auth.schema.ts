import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});


export const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
