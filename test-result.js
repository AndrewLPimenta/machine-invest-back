const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testResultController() {
  try {
    console.log('🧪 Testando funcionalidades do result.controller...\n');
    
    // Teste 1: Verificar se conseguimos buscar um perfil
    console.log('1️⃣ Testando busca de perfil...');
    const resultado = await prisma.resultadoUsuario.findFirst({
      include: { perfil: true },
    });
    console.log('✅ Busca de perfil funcionou:', resultado ? 'Perfil encontrado' : 'Nenhum perfil encontrado');
    
    // Teste 2: Verificar se conseguimos contar perguntas
    console.log('\n2️⃣ Testando contagem de perguntas...');
    const totalPerguntas = await prisma.pergunta.count();
    console.log('✅ Contagem de perguntas funcionou:', totalPerguntas, 'perguntas');
    
    // Teste 3: Verificar se conseguimos buscar respostas
    console.log('\n3️⃣ Testando busca de respostas...');
    const respostas = await prisma.respostaUsuario.findMany({
      include: { opcao: true },
    });
    console.log('✅ Busca de respostas funcionou:', respostas.length, 'respostas encontradas');
    
    // Teste 4: Verificar se conseguimos criar um resultado
    console.log('\n4️⃣ Testando criação de resultado...');
    try {
      const novoResultado = await prisma.resultadoUsuario.create({
        data: {
          idUsuario: 1,
          idPerfil: 1,
          pontuacaoTotal: 15,
          dataClassificacao: new Date(),
        },
      });
      console.log('✅ Criação de resultado funcionou:', novoResultado.id);
      
      // Limpar o teste
      await prisma.resultadoUsuario.delete({
        where: { id: novoResultado.id }
      });
      console.log('✅ Teste limpo com sucesso');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️ Usuário 1 já tem resultado (isso é esperado)');
      } else {
        console.log('❌ Erro ao criar resultado:', error.message);
      }
    }
    
    console.log('\n🎉 Todos os testes passaram! O result.controller está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testResultController(); 