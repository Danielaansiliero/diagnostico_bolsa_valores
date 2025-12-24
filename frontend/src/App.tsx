import { useState, useRef } from 'react';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { PriceChart } from './components/PriceChart';
import { Metrics } from './components/Metrics';
import { Diagnosis } from './components/Diagnosis';
import { Disclaimer } from './components/Disclaimer';
import { MarketOverview } from './components/MarketOverview';
import { getDiagnostico, DiagnosticoResponse } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiagnosticoResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (symbol: string, period: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDiagnostico(symbol, period);
      setData(result);
      // Scroll para os resultados
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    handleSearch(symbol, '1mo');
  };

  return (
    <div className="container">
      <Header />

      {/* Busca personalizada */}
      <SearchForm onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="loading">
          Analisando dados do ativo...
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Visão geral do mercado */}
      <MarketOverview onSelectStock={handleSelectStock} />

      {data && !loading && (
        <div ref={resultRef}>
          <PriceChart
            precos={data.precos}
            timestamps={data.timestamps}
            symbol={data.symbol}
          />
          <Metrics
            retorno={data.retorno}
            volatilidade={data.volatilidade}
            tendencia={data.tendencia}
          />
          <Diagnosis text={data.diagnostico} />
          <Disclaimer />
        </div>
      )}
    </div>
  );
}

export default App;
