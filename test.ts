import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const investimentos = await prisma.investimento.findMany()
  console.log(investimentos)
}

main()

