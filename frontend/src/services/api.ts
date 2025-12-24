export interface Ticker {
  symbol: string;
  name: string;
  logo: string;
  sector?: string;
  type?: string;
}

export interface DiagnosticoResponse {
  symbol: string;
  shortName: string;
  longName: string;
  logoUrl: string;
  periodo: string;
  retorno: number;
  volatilidade: string;
  tendencia: string;
  diagnostico: string;
  precos: number[];
  timestamps: number[];
  precoAtual: number;
  variacao: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  logo: string;
  sector: string;
}

export interface MarketOverview {
  indices: MarketIndex[];
  topGainers: MarketStock[];
  topLosers: MarketStock[];
  mostTraded: MarketStock[];
  totalVolume: number;
  updatedAt: string;
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const response = await fetch('/api/market-overview');

  if (!response.ok) {
    throw new Error('Erro ao buscar dados do mercado');
  }

  return response.json();
}

export async function searchTickers(query: string): Promise<Ticker[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const response = await fetch(`/api/tickers/search?q=${encodeURIComponent(query)}&limit=8`);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.tickers || [];
}

export async function getDiagnostico(symbol: string, period: string): Promise<DiagnosticoResponse> {
  const response = await fetch(`/api/diagnostico?symbol=${symbol}&period=${period}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar diagnóstico');
  }

  return response.json();
}
