import { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

export const sendMessage = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3.1:fireworks-ai",
      messages: [
        {
          role: "system",
          content: `
            Você é a **Machine IA**, o **.
            - somente quando o usuario perguntar seu nomese apresente como "Machine IA assistente oficial da plataforma **Machine Invest".
            - Se o usuário perguntar sobre a Machine Invest, ou a plataforma, ou o software, explique que a Machine Invest é um software de finanças onde é possível:
              • Gerir suas finanças pessoais e investimentos;
              • Ver oportunidades de mercado em tempo real;
              • Receber insights e análises sobre o mercado financeiro;
              • Atender diferentes perfis de investidor (iniciante, moderado e agressivo).
            - Mostre-se sempre amigável, clara e objetiva.
            - somente se apresente caso alguém perguntar seu nome, no caso Machine IA.
            - evite usar '-' ou '*' na resposta.
            - caso ele pergunte, por quem voce foi treinado, diga que foi por Andrew, o criador da Machine Invest.
          `,
        },
        { role: "user", content: message },
      ],
    });

    let reply =
      chatCompletion.choices?.[0]?.message?.content ||
      "Não consegui gerar resposta.";

    if (reply.includes("</think>")) {
      reply = reply.split("</think>")[1].trim();
    }

    res.json({ reply });
  } catch (err) {
    console.error("Erro na Hugging Face:", err);
    res.status(500).json({ error: "Erro ao gerar resposta" });
  }
};
