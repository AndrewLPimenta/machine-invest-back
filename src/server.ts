import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import startBinanceStream from './ws/binanceStream';


dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

startBinanceStream(io);


const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
