import axios from "axios";
import { Request, Response } from "express";

export async function ApostaMercado(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.betano.com/v3/bet/${id}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erro ao buscar aposta:", error);
        res.status(500).json({ error: "Erro ao buscar aposta" });
    }
}