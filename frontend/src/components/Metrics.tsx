interface MetricsProps {
  retorno: number;
  volatilidade: string;
  tendencia: string;
}

export function Metrics({ retorno, volatilidade, tendencia }: MetricsProps) {
  const retornoClass = retorno >= 0 ? 'positive' : 'negative';

  const tendenciaClass =
    tendencia === 'Alta' ? 'positive' :
    tendencia === 'Baixa' ? 'negative' : 'neutral';

  const volatilidadeClass =
    volatilidade === 'Baixa' ? 'positive' :
    volatilidade === 'Alta' ? 'negative' : 'neutral';

  return (
    <div className="metrics">
      <div className="metric-card">
        <h4>Retorno</h4>
        <span className={`value ${retornoClass}`}>
          {retorno >= 0 ? '+' : ''}{(retorno * 100).toFixed(1)}%
        </span>
      </div>

      <div className="metric-card">
        <h4>Volatilidade</h4>
        <span className={`value ${volatilidadeClass}`}>
          {volatilidade}
        </span>
      </div>

      <div className="metric-card">
        <h4>Tendência</h4>
        <span className={`value ${tendenciaClass}`}>
          {tendencia === 'Alta' && '↑ '}
          {tendencia === 'Baixa' && '↓ '}
          {tendencia === 'Lateral' && '→ '}
          {tendencia}
        </span>
      </div>
    </div>
  );
}
