// src/prisma/client.ts

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// ⚠️ Carrega variáveis de ambiente antes de qualquer uso do Prisma
dotenv.config();

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Cria a instância do Prisma, adicionando logs detalhados
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // logs detalhados para debug
  });

// Evita múltiplas instâncias durante desenvolvimento com nodemon/ts-node
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Função opcional para teste de conexão rápida (healthcheck)
export const testDbConnection = async () => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("✅ Conexão com DB OK:", result);
  } catch (err) {
    console.error("❌ Erro ao conectar com DB:", err);
  }
};
