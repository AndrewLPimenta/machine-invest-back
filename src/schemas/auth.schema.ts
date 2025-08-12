import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1,"Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha Deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().min(1,"Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha Deve ter pelo menos 6 caracteres"),
});