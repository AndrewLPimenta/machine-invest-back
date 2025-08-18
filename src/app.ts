import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import formRoutes from './routes/form.routes';
import answerRoutes from './routes/answer.routes';
import resultRoutes from './routes/result.routes';
import profileInvest from './routes/profile.routes';
import userRoutes from "./routes/user.routes";
import cryptoRoutes from './routes/crypto.routes';
import tesouroRoutes from './routes/tesouro.routes';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/formulario', formRoutes);
app.use('/api/respostas', answerRoutes);
app.use('/api/resultado', resultRoutes);
app.use('/api/perfil', profileInvest);
app.use('/api/usuario', userRoutes);
app.use('/api/cripto', cryptoRoutes);
app.use('/api', tesouroRoutes);

export default app;
