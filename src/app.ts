import express from 'express';
import cors from 'cors';
import authRouthes from './routes/auth.routes';
import formRoutes from './routes/form.routes';
import answerRoutes from './routes/answer.routes';
import resultRoutes from './routes/result.routes';
import profileInvest from './routes/profile.routes';
import dotenv from 'dotenv';

dotenv.config();


const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRouthes);
app.use('/api/formulario', formRoutes);
app.use('/api/respostas', answerRoutes);
app.use('/api/resultado', resultRoutes);
app.use('/api/perfil', profileInvest);

export default app;