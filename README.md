# Diagnóstico de Ativos da Bolsa

Análise histórica visual e educacional de ações da B3 (Bolsa de Valores Brasileira).

## Demo

**Acesse o projeto:** https://diagnostico-bolsa-valores.vercel.app

> **Nota:** O backend está hospedado no plano gratuito do Render, que entra em modo de espera após 15 minutos de inatividade. A primeira requisição pode levar ~50 segundos para "acordar" o servidor. Após isso, as próximas requisições serão rápidas.

---

## Objetivo

Página que gera um diagnóstico visual de um ativo da bolsa, com parâmetros ajustáveis e dashboard interativo.

**Proposta de valor:** Uma página que recebe um ativo da bolsa e entrega um diagnóstico visual e textual da sua performance histórica.

---

## Funcionalidades

- **Dashboard de Mercado:** Visão geral com IBOVESPA, volume total, maiores altas, maiores baixas e ações mais negociadas
- **Autocomplete de Tickers:** Busca inteligente de ativos com logo e nome da empresa
- **Análise Individual:** Gráfico de preços + métricas + diagnóstico textual
- **Design Responsivo:** Funciona em desktop, tablet e mobile
- **Tema Futurístico:** Interface moderna com efeitos de glassmorphism e neon

---

## Arquitetura

```
[ Frontend (React + Vite + TypeScript) ]
              ↓
[ Backend (Node.js + Express) ]
              ↓
[ brapi.dev API ]
```

**Por que essa arquitetura?**
- **Segurança:** API key protegida no backend
- **Cache:** Menos chamadas à API externa
- **Maturidade técnica:** Demonstra separação de responsabilidades

---

## Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Recharts |
| **Backend** | Node.js, Express |
| **API** | brapi.dev (dados da B3) |
| **Estilização** | CSS3 (Glassmorphism, Animations) |

---

## Instalação

### Pré-requisitos
- Node.js 18+
- Token da API brapi.dev (obtenha em https://brapi.dev)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com seu token da brapi.dev
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O backend roda em `http://localhost:3001` e o frontend em `http://localhost:3000`.

---

## Variáveis de Ambiente

### Backend (.env)
```
BRAPI_TOKEN=seu_token_aqui
PORT=3001
```

---

## Endpoints da API

### GET /api/market-overview
Retorna visão geral do mercado: IBOVESPA, maiores altas/baixas, mais negociadas.

### GET /api/diagnostico?symbol=PETR4&period=1mo
Retorna diagnóstico completo de um ativo.

**Períodos disponíveis:** `1d`, `5d`, `1mo`, `3mo`

### GET /api/tickers/search?q=PET&limit=8
Busca tickers para autocomplete.

### GET /api/health
Health check do servidor.

---

## Estrutura do Projeto

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── SearchForm.tsx      # Autocomplete
│   │   │   ├── PriceChart.tsx      # Gráfico responsivo
│   │   │   ├── Metrics.tsx
│   │   │   ├── Diagnosis.tsx
│   │   │   ├── Disclaimer.tsx
│   │   │   └── MarketOverview.tsx  # Dashboard
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.css               # Tema futurístico
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── utils/
│   │       ├── calculations.js
│   │       └── diagnosis.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Métricas Calculadas

### 1. Retorno Acumulado
Quanto o ativo rendeu no período analisado.

### 2. Volatilidade
Classificada como Baixa, Moderada ou Alta baseada no desvio padrão dos retornos.

### 3. Tendência
Identificada como Alta, Baixa ou Lateral baseada na média móvel.

---

## Screenshots

### Dashboard de Mercado
- IBOVESPA em tempo real
- Volume de negociações
- Top 5 maiores altas
- Top 5 maiores baixas
- Top 5 mais negociadas

### Análise Individual
- Gráfico de área com gradiente
- Cards de métricas
- Diagnóstico textual automático

---

## Limitações do Plano Gratuito (brapi.dev)

- Períodos históricos: apenas 1d, 5d, 1mo, 3mo
- Sem cotação de moedas (USD/BRL)
- Rate limit de requisições

---

## Roadmap

- [ ] Comparação entre ativos
- [ ] Exportar relatório em PDF
- [ ] Modo claro/escuro
- [ ] Cache no backend
- [ ] PWA (instalável)

---

## Licença

Este projeto é educacional e não constitui recomendação de investimento.

---

## Autor

Desenvolvido com React + Node.js + brapi.dev
