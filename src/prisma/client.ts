import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();


async function main() {
  try {
    const usuarios = await prisma.usuario.findMany();
    console.log("Usuários encontrados:", usuarios);
  } catch (error) {
    console.error("Erro ao conectar ou buscar dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
