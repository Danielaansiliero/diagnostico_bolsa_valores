import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  calcularRetorno,
  calcularVolatilidade,
  classificarVolatilidade,
  identificarTendencia
} from './utils/calculations.js';
import { gerarDiagnostico, periodoParaTexto } from './utils/diagnosis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

app.use(cors());
app.use(express.json());

/**
 * Configuração de período e intervalo
 */
function getConfigPeriodo(period) {
  const config = {
    '1d': { range: '1d', interval: '1h' },
    '5d': { range: '5d', interval: '1d' },
    '1mo': { range: '1mo', interval: '1d' },
    '3mo': { range: '3mo', interval: '1d' }
  };
  return config[period] || config['1mo'];
}

/**
 * Endpoint de busca de tickers (autocomplete)
 * GET /api/tickers/search?q=PET&limit=10
 */
app.get('/api/tickers/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 1) {
      return res.json({ tickers: [] });
    }

    if (!BRAPI_TOKEN) {
      return res.status(500).json({ error: 'Token da API não configurado' });
    }

    const url = `https://brapi.dev/api/quote/list?search=${encodeURIComponent(q)}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BRAPI_TOKEN}`
      }
    });

    const data = await response.json();

    if (!data.stocks || data.stocks.length === 0) {
      return res.json({ tickers: [] });
    }

    const tickers = data.stocks.map(stock => ({
      symbol: stock.stock,
      name: stock.name,
      logo: stock.logo,
      sector: stock.sector,
      type: stock.type
    }));

    res.json({ tickers });

  } catch (error) {
    console.error('Erro na busca de tickers:', error);
    res.status(500).json({ error: 'Erro ao buscar tickers' });
  }
});

/**
 * Endpoint principal de diagnóstico
 * GET /api/diagnostico?symbol=PETR4&period=1y
 */
app.get('/api/diagnostico', async (req, res) => {
  try {
    const { symbol, period = '1y' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Ticker é obrigatório' });
    }

    if (!BRAPI_TOKEN) {
      return res.status(500).json({ error: 'Token da API não configurado' });
    }

    const { range, interval } = getConfigPeriodo(period);
    const url = `https://brapi.dev/api/quote/${symbol.toUpperCase()}?range=${range}&interval=${interval}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BRAPI_TOKEN}`
      }
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(400).json({
        error: 'Ticker inválido ou sem dados disponíveis',
        symbol: symbol.toUpperCase()
      });
    }

    const resultado = data.results[0];
    const historico = resultado.historicalDataPrice;

    if (!historico || historico.length === 0) {
      return res.status(400).json({
        error: 'Sem dados históricos disponíveis',
        symbol: symbol.toUpperCase()
      });
    }

    // Extrair preços de fechamento e timestamps
    const precos = historico.map(item => item.close);
    const timestamps = historico.map(item => item.date);

    // Cálculos
    const retorno = calcularRetorno(precos);
    const volatilidadeValor = calcularVolatilidade(precos);
    const volatilidade = classificarVolatilidade(volatilidadeValor);
    const tendencia = identificarTendencia(precos);

    // Diagnóstico textual
    const diagnostico = gerarDiagnostico({
      retorno,
      volatilidade,
      tendencia,
      periodo: periodoParaTexto(period)
    });

    res.json({
      symbol: resultado.symbol,
      shortName: resultado.shortName,
      longName: resultado.longName,
      logoUrl: resultado.logourl,
      periodo: periodoParaTexto(period),
      retorno,
      volatilidade,
      tendencia,
      diagnostico,
      precos,
      timestamps,
      precoAtual: resultado.regularMarketPrice,
      variacao: resultado.regularMarketChangePercent
    });

  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Visão geral do mercado
 * GET /api/market-overview
 */
app.get('/api/market-overview', async (req, res) => {
  try {
    if (!BRAPI_TOKEN) {
      return res.status(500).json({ error: 'Token da API não configurado' });
    }

    const headers = { 'Authorization': `Bearer ${BRAPI_TOKEN}` };

    // Buscar dados em paralelo
    const [ibovespaRes, topGainersRes, topLosersRes, mostTradedRes] = await Promise.all([
      // IBOVESPA
      fetch('https://brapi.dev/api/quote/^BVSP', { headers }),
      // Top 5 altas (apenas ações)
      fetch('https://brapi.dev/api/quote/list?limit=5&type=stock&sortBy=change&sortOrder=desc', { headers }),
      // Top 5 baixas (apenas ações)
      fetch('https://brapi.dev/api/quote/list?limit=5&type=stock&sortBy=change&sortOrder=asc', { headers }),
      // Mais negociadas (apenas ações)
      fetch('https://brapi.dev/api/quote/list?limit=5&type=stock&sortBy=volume&sortOrder=desc', { headers })
    ]);

    const [ibovespaData, topGainersData, topLosersData, mostTradedData] = await Promise.all([
      ibovespaRes.json(),
      topGainersRes.json(),
      topLosersRes.json(),
      mostTradedRes.json()
    ]);

    // Processar índices
    const indices = [];

    // IBOVESPA
    if (ibovespaData.results && ibovespaData.results[0]) {
      const idx = ibovespaData.results[0];
      indices.push({
        symbol: idx.symbol,
        name: idx.shortName || 'IBOVESPA',
        price: idx.regularMarketPrice,
        change: idx.regularMarketChange,
        changePercent: idx.regularMarketChangePercent
      });
    }


    // Processar ações
    const formatStock = (stock) => ({
      symbol: stock.stock,
      name: stock.name,
      price: stock.close,
      change: stock.change,
      volume: stock.volume,
      logo: stock.logo,
      sector: stock.sector
    });

    const topGainers = (topGainersData.stocks || [])
      .filter(s => s.change !== null && s.change > 0)
      .map(formatStock);

    const topLosers = (topLosersData.stocks || [])
      .filter(s => s.change !== null && s.change < 0)
      .map(formatStock);

    const mostTraded = (mostTradedData.stocks || [])
      .filter(s => s.volume > 0)
      .map(formatStock);

    // Calcular volume total
    const totalVolume = mostTraded.reduce((acc, s) => acc + (s.volume || 0), 0);

    res.json({
      indices,
      topGainers,
      topLosers,
      mostTraded,
      totalVolume,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar visão geral:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do mercado' });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Token BRAPI configurado: ${BRAPI_TOKEN ? 'Sim' : 'Não'}`);
});
