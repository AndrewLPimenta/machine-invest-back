import app from './app'; // Importando o arquivo principal do servidor
import dotenv from 'dotenv'; // Importando dotenv para gerenciar variáveis de ambiente
import http from 'http'; // Importando o módulo http
import { Server } from 'socket.io'; // Importando o módulo Socket.IO para comunicação em tempo real (cripto)
import startBinanceStream from './ws/binanceStream'; // Importando a função que inicia o stream da api Binance


dotenv.config(); // Carregando as variáveis de ambiente do arquivo .env

const server = http.createServer(app); // Criando o servidor HTTP a partir do aplicativo Express

// Configurando o Socket.IO para o servidor HTTP (comunicação em tempo real)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
 // Iniciando o stream (api) da Binance para enviar dados em tempo real
startBinanceStream(io);

// Definindo a porta do servidor a partir das variáveis de ambiente (ambiente de desenvolvimento por enquanto)
const PORT = process.env.PORT;

// Iniciando o servidor e escutando na porta definida
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
