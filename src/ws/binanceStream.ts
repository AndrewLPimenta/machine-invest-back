import WebSocket from 'ws';
import fetch from 'node-fetch';
import { Server } from 'socket.io';

interface BinanceTicker {
  symbol: string;
  price: string;
}

interface BinanceWsMessage {
  stream: string;
  data: {
    e: string;  // tipo de evento
    E: number;  // timestamp
    s: string;  // símbolo (ex: BTCUSDT)
    c: string;  // último preço
  };
}

let taxas: { [key: string]: number } = { USD: 1, BRL: 5.0, EUR: 0.9 };

// Atualiza taxas de câmbio BRL/EUR via Binance
async function atualizarTaxas() {
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbols=["USDTBRL","USDTEUR"]'
    );
    const data = (await res.json()) as BinanceTicker[];

    const brl = data.find(d => d.symbol === "USDTBRL");
    const eur = data.find(d => d.symbol === "USDTEUR");

    if (brl) taxas["BRL"] = parseFloat(brl.price);
    if (eur) taxas["EUR"] = parseFloat(eur.price);

    console.log("💱 Taxas atualizadas:", taxas);
  } catch (err) {
    console.error("Erro ao atualizar taxas:", err);
  }
}

// Busca preços iniciais e envia ao cliente
async function enviarPrecosIniciais(io: Server, pares: string[]) {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbols=[${pares
        .map(p => `"${p.toUpperCase()}"`)
        .join(',')}]`
    );
    const data = (await res.json()) as BinanceTicker[];

    data.forEach(d => {
      const precoUSD = parseFloat(d.price);
      io.emit('precoAtualizado', {
        symbol: d.symbol.replace('USDT', ''),
        USD: precoUSD,
        BRL: precoUSD * taxas["BRL"],
        EUR: precoUSD * taxas["EUR"]
      });
    });
  } catch (err) {
    console.error("Erro ao enviar preços iniciais:", err);
  }
}

// Atualiza taxas a cada 1 min
setInterval(atualizarTaxas, 60_000);
atualizarTaxas();

// Inicia WebSocket Binance
export default function startBinanceStream(io: Server) {
  const pares = [
    'btcusdt', // Bitcoin
    'ethusdt', // Ethereum
    'bnbusdt', // Binance Coin
    'adausdt', // Cardano
    'xrpusdt', // XRP
    'solusdt', // Solana
    'dogeusdt', // Dogecoin
    'maticusdt', // Polygon
    'dotusdt', // Polkadot
    'shibusdt', // Shiba Inu
    'ltcusdt', // Litecoin
    'avaxusdt', // Avalanche
    'uniusdt', // Uniswap
    'linkusdt', // Chainlink
    'atomusdt', // Cosmos
    'trxusdt', // TRON
    'etcusdt', // Ethereum Classic
    'xlmusdt', // Stellar
    'nearusdt', // NEAR Protocol
    'aptusdt'  // Aptos
  ];

  // Envia preços iniciais antes de conectar WS
  enviarPrecosIniciais(io, pares);

  const streams = pares.map((p) => `${p}@ticker`).join('/');
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streams}`
  );

  ws.on('message', (msg: WebSocket.RawData) => {
    try {
      const dados = JSON.parse(msg.toString()) as BinanceWsMessage;

      if (dados?.data?.c && dados?.data?.s) {
        const precoUSD = parseFloat(dados.data.c);
        io.emit('precoAtualizado', {
          symbol: dados.data.s.replace('USDT', ''),
          USD: precoUSD,
          BRL: precoUSD * taxas["BRL"],
          EUR: precoUSD * taxas["EUR"]
        });
      }
    } catch (err) {
      console.error("Erro ao processar mensagem WS:", err);
    }
  });

  ws.on('error', (err) => {
    console.error("Erro no WebSocket da Binance:", err);
  });

  ws.on('close', () => {
    console.log("🔌 Conexão fechada com a Binance. Reconectando...");
    setTimeout(() => startBinanceStream(io), 5000);
  });
}
