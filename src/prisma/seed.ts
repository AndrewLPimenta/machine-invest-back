import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Inserir perfis de investidor
  await prisma.perfilInvestidor.createMany({
    data: [
      { nomePerfil: 'Conservador', descricao: 'Perfil com menor risco, prioriza segurança do capital.' },
      { nomePerfil: 'Moderado', descricao: 'Busca equilíbrio entre segurança e rentabilidade.' },
      { nomePerfil: 'Agressivo', descricao: 'Aceita mais riscos para maior potencial de retorno.' },
    ],
    skipDuplicates: true,
  });

  // 2. Criar formulário
  const formulario = await prisma.formulario.create({
    data: {
      titulo: 'Questionário Profissional de Perfil de Investidor',
      descricao: 'Formulário para classificar o perfil do investidor',
    },
  });

  // 3. Perguntas completas (antigas + novas) - todas múltipla escolha
  const perguntas = [
    {
      texto: 'Qual seu principal objetivo com os investimentos?',
      opcoes: [
        { texto: 'Preservar o capital e evitar riscos', pontuacao: 1 },
        { texto: 'Obter retorno moderado, aceitando algum risco', pontuacao: 2 },
        { texto: 'Maximizar os ganhos, aceitando altos riscos', pontuacao: 3 },
      ],
    },
    {
      texto: 'Qual é sua fonte principal de renda?',
      opcoes: [
        { texto: 'Salário fixo e estável', pontuacao: 1 },
        { texto: 'Renda variável (freelas, comissões)', pontuacao: 2 },
        { texto: 'Renda instável ou múltiplas fontes', pontuacao: 3 },
      ],
    },
    {
      texto: 'Você tem reserva financeira para emergências?',
      opcoes: [
        { texto: 'Sim, para mais de 6 meses', pontuacao: 1 },
        { texto: 'Sim, para 3 a 6 meses', pontuacao: 2 },
        { texto: 'Não, ou menos que 3 meses', pontuacao: 3 },
      ],
    },
    {
      texto: 'Quanto tempo pretende deixar seu dinheiro investido?',
      opcoes: [
        { texto: 'Mais de 5 anos', pontuacao: 3 },
        { texto: 'Entre 2 e 5 anos', pontuacao: 2 },
        { texto: 'Menos de 2 anos', pontuacao: 1 },
      ],
    },
    {
      texto: 'Como você reagiria se seu investimento caísse 15% em um mês?',
      opcoes: [
        { texto: 'Venderia tudo para evitar maiores perdas', pontuacao: 1 },
        { texto: 'Esperaria e avaliaria antes de decidir', pontuacao: 2 },
        { texto: 'Aproveitaria para comprar mais e reduzir o custo', pontuacao: 3 },
      ],
    },
    {
      texto: 'Qual percentual do seu patrimônio você quer investir em ações?',
      opcoes: [
        { texto: 'Menos de 10%', pontuacao: 1 },
        { texto: 'Entre 10% e 40%', pontuacao: 2 },
        { texto: 'Mais de 40%', pontuacao: 3 },
      ],
    },
    {
      texto: 'Você já investiu em algum dos seguintes ativos alternativos?',
      opcoes: [
        { texto: 'Nenhum, prefiro investimentos tradicionais', pontuacao: 1 },
        { texto: 'Imóveis, fundos imobiliários ou renda fixa', pontuacao: 2 },
        { texto: 'Criptomoedas, startups, commodities', pontuacao: 3 },
      ],
    },
    {
      texto: 'Quanto tempo você dedica para se informar sobre investimentos?',
      opcoes: [
        { texto: 'Pouco ou quase nada', pontuacao: 1 },
        { texto: 'Algumas horas por semana', pontuacao: 2 },
        { texto: 'Muito, acompanho diariamente', pontuacao: 3 },
      ],
    },
    {
      texto: 'Como você descreveria seu conhecimento sobre investimentos?',
      opcoes: [
        { texto: 'Básico', pontuacao: 1 },
        { texto: 'Intermediário', pontuacao: 2 },
        { texto: 'Avançado', pontuacao: 3 },
      ],
    },
    {
      texto: 'Quanto você costuma destinar mensalmente para gastos fixos?',
      opcoes: [
        { texto: 'Mais de 80% da renda', pontuacao: 1 },
        { texto: 'Entre 50% e 80%', pontuacao: 2 },
        { texto: 'Menos de 50%', pontuacao: 3 },
      ],
    },
    // Novas perguntas
    {
      texto: 'Qual sua experiência com investimentos?',
      opcoes: [
        { texto: 'Iniciante', pontuacao: 1 },
        { texto: 'Intermediário', pontuacao: 2 },
        { texto: 'Avançado', pontuacao: 3 },
      ],
    },
    {
      texto: 'Qual seu horizonte de investimento?',
      opcoes: [
        { texto: 'Curto prazo (até 2 anos)', pontuacao: 1 },
        { texto: 'Médio prazo (2-5 anos)', pontuacao: 2 },
        { texto: 'Longo prazo (mais de 5 anos)', pontuacao: 3 },
      ],
    },
    {
      texto: 'Como você reagiria a uma perda de 20% em seus investimentos?',
      opcoes: [
        { texto: 'Venderia tudo', pontuacao: 1 },
        { texto: 'Manteria os investimentos', pontuacao: 2 },
        { texto: 'Compraria mais', pontuacao: 3 },
      ],
    },
    {
      texto: 'Qual seu nível de conhecimento sobre o mercado financeiro?',
      opcoes: [
        { texto: 'Básico', pontuacao: 1 },
        { texto: 'Intermediário', pontuacao: 2 },
        { texto: 'Avançado', pontuacao: 3 },
      ],
    },
    {
      texto: 'Quais são seus objetivos de investimento?',
      opcoes: [
        { texto: 'Reserva de emergência', pontuacao: 1 },
        { texto: 'Aposentadoria', pontuacao: 1 },
        { texto: 'Comprar imóvel', pontuacao: 1 },
        { texto: 'Educação dos filhos', pontuacao: 1 },
        { texto: 'Viagens', pontuacao: 1 },
        { texto: 'Renda extra', pontuacao: 1 },
        { texto: 'Preservar patrimônio', pontuacao: 1 },
      ],
    },
    {
      texto: 'Em uma escala de 1 a 10, qual sua tolerância ao risco?',
      opcoes: [
        { texto: '1', pontuacao: 1 },
        { texto: '2', pontuacao: 1 },
        { texto: '3', pontuacao: 2 },
        { texto: '4', pontuacao: 2 },
        { texto: '5', pontuacao: 2 },
        { texto: '6', pontuacao: 3 },
        { texto: '7', pontuacao: 3 },
        { texto: '8', pontuacao: 3 },
        { texto: '9', pontuacao: 3 },
        { texto: '10', pontuacao: 3 },
      ],
    },
  ];

  // 4. Inserir perguntas no banco
  for (const pergunta of perguntas) {
    await prisma.pergunta.create({
      data: {
        texto: pergunta.texto,
        idFormulario: formulario.id,
        opcoes: {
          create: pergunta.opcoes,
        },
      },
    });
  }

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
