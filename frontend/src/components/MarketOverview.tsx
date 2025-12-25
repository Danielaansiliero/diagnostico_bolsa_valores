import { useEffect, useState } from 'react';
import { getMarketOverview, MarketOverview as MarketOverviewData, MarketStock } from '../services/api';

interface MarketOverviewProps {
  onSelectStock: (symbol: string) => void;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockRow({ stock, onClick }: { stock: MarketStock; onClick: () => void }) {
  const isPositive = stock.change >= 0;

  return (
    <div className="stock-row" onClick={onClick}>
      <div className="stock-info">
        {stock.logo && (
          <img
            src={stock.logo}
            alt={stock.symbol}
            className="stock-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="stock-details">
          <span className="stock-symbol">{stock.symbol}</span>
          <span className="stock-name">{stock.name}</span>
        </div>
      </div>
      <div className="stock-price">
        <span className="price-value">R$ {formatCurrency(stock.price)}</span>
        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function MarketOverview({ onSelectStock }: MarketOverviewProps) {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const overview = await getMarketOverview();
        setData(overview);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados do mercado');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="market-overview">
        <div className="market-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados do mercado...</p>
          <span className="loading-hint">A primeira requisição pode levar alguns segundos</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const ibovespa = data.indices.find(i => i.symbol === '^BVSP');

  return (
    <div className="market-overview">
      {/* Índices principais */}
      <div className="indices-bar">
        {ibovespa && (
          <div className="index-card">
            <span className="index-name">IBOVESPA</span>
            <span className="index-value">{formatNumber(ibovespa.price)} pts</span>
            <span className={`index-change ${ibovespa.changePercent >= 0 ? 'positive' : 'negative'}`}>
              {ibovespa.changePercent >= 0 ? '+' : ''}{ibovespa.changePercent?.toFixed(2)}%
            </span>
          </div>
        )}
        <div className="index-card">
          <span className="index-name">VOLUME</span>
          <span className="index-value">{formatNumber(data.totalVolume)}</span>
          <span className="index-label">negociações</span>
        </div>
      </div>

      {/* Grid de listas */}
      <div className="market-grid">
        {/* Top Altas */}
        <div className="market-card gainers">
          <div className="card-header">
            <h3>Maiores Altas</h3>
            <span className="card-icon">↑</span>
          </div>
          <div className="stock-list">
            {data.topGainers.slice(0, 5).map(stock => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                onClick={() => onSelectStock(stock.symbol)}
              />
            ))}
          </div>
        </div>

        {/* Top Baixas */}
        <div className="market-card losers">
          <div className="card-header">
            <h3>Maiores Baixas</h3>
            <span className="card-icon">↓</span>
          </div>
          <div className="stock-list">
            {data.topLosers.slice(0, 5).map(stock => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                onClick={() => onSelectStock(stock.symbol)}
              />
            ))}
          </div>
        </div>

        {/* Mais Negociadas */}
        <div className="market-card volume">
          <div className="card-header">
            <h3>Mais Negociadas</h3>
            <span className="card-icon">$</span>
          </div>
          <div className="stock-list">
            {data.mostTraded.slice(0, 5).map(stock => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                onClick={() => onSelectStock(stock.symbol)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
