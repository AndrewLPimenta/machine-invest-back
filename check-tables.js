const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Verificar se conseguimos conectar
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados com sucesso!');
    
    // Tentar fazer uma consulta simples para verificar se as tabelas existem
    const userCount = await prisma.usuario.count();
    console.log(`✅ Tabela Usuario existe - ${userCount} registros`);
    
    const formCount = await prisma.formulario.count();
    console.log(`✅ Tabela Formulario existe - ${formCount} registros`);
    
    const questionCount = await prisma.pergunta.count();
    console.log(`✅ Tabela Pergunta existe - ${questionCount} registros`);
    
    const optionCount = await prisma.opcao.count();
    console.log(`✅ Tabela Opcao existe - ${optionCount} registros`);
    
    const answerCount = await prisma.respostaUsuario.count();
    console.log(`✅ Tabela RespostaUsuario existe - ${answerCount} registros`);
    
    const profileCount = await prisma.perfilInvestidor.count();
    console.log(`✅ Tabela PerfilInvestidor existe - ${profileCount} registros`);
    
    const resultCount = await prisma.resultadoUsuario.count();
    console.log(`✅ Tabela ResultadoUsuario existe - ${resultCount} registros`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables(); 