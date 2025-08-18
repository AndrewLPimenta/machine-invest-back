import { Request, Response } from 'express';
import axios from 'axios';

interface TituloTesouro {
  isin: string;
  name: string;
  due_date: string;
  index: string;
  minimum_value: number;
  price: number;
  rate: number;
  reference_date: string;
}

const TOKEN = 'seu_token_aqui';

export const fetchTesouro = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get<TituloTesouro[]>(
      'https://api.dadosdemercado.com.br/v1/treasury',
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    const titulos = response.data;

    const conservadores = titulos.filter(t =>
      t.name.toLowerCase().includes('selic') || t.name.toLowerCase().includes('ipca')
    );

    res.json({ titulos: conservadores });
  } catch (err: unknown) {
    const error = err as any; // permite acessar error.response
    console.error(error?.response?.data ?? error?.message ?? error);
    res.status(500).json({ error: 'Erro ao buscar dados do Tesouro Direto' });
  }
};
