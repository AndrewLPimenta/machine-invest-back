
import express from 'express';//arquivo app.ts (principal do servidor)
import cors from 'cors';// Importando os módulos necessários (biblioteca de api)
import dotenv from 'dotenv';//importando a abertura de requisições de ambiente
import authRoutes from './routes/auth.routes'; // autentica usuario
import formRoutes from './routes/form.routes'; // formulário de perguntas
import answerRoutes from './routes/answer.routes'; // respostas do formulário
import resultRoutes from './routes/result.routes'; // retorno do usuário + classificão
import profileInvest from './routes/profile.routes'; // perfil de investidor
import userRoutes from "./routes/user.routes"; // rotas de usuário (CRUD)
import cryptoRoutes from './routes/agressivoRoutes/crypto.routes'; // rotas de criptomoeda (agressivo)
import tesouroRoutes from './routes/convervadorRoutes/tesouro.routes'; // rotas de tesouro (conservador)
import { AcoesMercado } from './controllers/controllers.moderado/actions.controller'; // rotas de ações (moderado)
import emergingTechRoutes from "./routes/agressivoRoutes/emergingTech.routes";; // rotas de ações (agressivo)
import { logoutUser } from "./controllers/logout.controller"; 
dotenv.config(); //habilitando as variáveis de ambiente (privadas)

const app = express(); //abrindo/executando o servidor

app.use(cors()); // habilitando o CORS para permitir requisições de outros domínios (front-end)

app.use(express.json()); // habilitando o JSON para receber e enviar dados no formato JSON

//rotas das apis/endpoints (URLs) do servidor

app.use('/api/auth', authRoutes);
app.use('/api/formulario', formRoutes);
app.use('/api/respostas', answerRoutes);
app.use('/api/resultado', resultRoutes);
app.use('/api/perfil', profileInvest);
app.use('/api/usuario', userRoutes);
app.use('/api/cripto', cryptoRoutes);
app.use('/api', tesouroRoutes);
app.use ('/api/acoes', AcoesMercado);
app.use("/api/stocks", emergingTechRoutes);

// Rota de teste para verificar se o servidor está funcionando

export default app;
