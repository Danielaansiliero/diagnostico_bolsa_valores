import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface PriceChartProps {
  precos: number[];
  timestamps: number[];
  symbol: string;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export function PriceChart({ precos, timestamps, symbol }: PriceChartProps) {
  const windowWidth = useWindowWidth();
  const data = precos.map((price, index) => ({
    date: new Date(timestamps[index] * 1000).toLocaleDateString('pt-BR'),
    price: price
  }));

  // Configurações responsivas
  const isMobile = windowWidth < 480;
  const isTablet = windowWidth < 768;
  const chartHeight = isMobile ? 220 : isTablet ? 280 : 350;
  const fontSize = isMobile ? 9 : isTablet ? 10 : 11;
  const tickCount = isMobile ? 4 : 6;

  // Mostrar apenas alguns labels no eixo X para não poluir
  const tickInterval = Math.floor(data.length / tickCount);

  // Determinar se é tendência de alta ou baixa
  const isUptrend = precos[precos.length - 1] >= precos[0];
  const lineColor = isUptrend ? '#00ff88' : '#ff3366';
  const gradientId = isUptrend ? 'greenGradient' : 'redGradient';

  return (
    <div className="chart-container">
      <h2>Histórico de Preços - {symbol}</h2>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3366" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ff3366" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize, fill: '#94a3b8' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontSize, fill: '#94a3b8' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `R$${value.toFixed(0)}`}
            width={isMobile ? 45 : 55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #00f5ff',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
              fontFamily: 'Rajdhani, sans-serif'
            }}
            labelStyle={{ color: '#00f5ff', fontWeight: 600 }}
            itemStyle={{ color: '#f0f4f8' }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Preço']}
            labelFormatter={(label) => `${label}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            filter="url(#glow)"
            dot={false}
            activeDot={{
              r: 6,
              fill: lineColor,
              stroke: '#0a0e17',
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
