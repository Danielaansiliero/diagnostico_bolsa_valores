/**
 * Gerador de diagnóstico textual
 */

/**
 * Gera o texto de diagnóstico baseado nas métricas
 * @param {Object} params - Parâmetros do diagnóstico
 * @param {number} params.retorno - Retorno acumulado (decimal)
 * @param {string} params.volatilidade - Classificação da volatilidade
 * @param {string} params.tendencia - Tendência identificada
 * @param {string} params.periodo - Período analisado em texto
 * @returns {string} - Texto do diagnóstico
 */
export function gerarDiagnostico({ retorno, volatilidade, tendencia, periodo }) {
  // Adaptar introdução baseado no período
  const isPeriodoCurto = ['1 dia', '5 dias', '1 mês'].includes(periodo);

  let texto;
  if (periodo === '1 dia') {
    texto = `No pregão de hoje, o comportamento do ativo indica:\n\n`;
  } else if (isPeriodoCurto) {
    texto = `Nos últimos ${periodo}, o comportamento do ativo indica:\n\n`;
  } else {
    texto = `Nos últimos ${periodo}, o comportamento histórico do ativo indica:\n\n`;
  }

  // Retorno
  if (retorno >= 0) {
    texto += `• Retorno de ${(retorno * 100).toFixed(1)}%, indicando valorização no período.\n`;
  } else {
    texto += `• Queda de ${Math.abs(retorno * 100).toFixed(1)}%, indicando desvalorização no período.\n`;
  }

  // Volatilidade
  if (volatilidade === "Baixa") {
    texto += `• Oscilações de preço baixas, sugerindo comportamento mais estável.\n`;
  } else if (volatilidade === "Moderada") {
    texto += `• Oscilações moderadas, indicando presença de risco controlado.\n`;
  } else {
    texto += `• Oscilações elevadas, indicando maior nível de risco.\n`;
  }

  // Tendência
  if (tendencia === "Alta") {
    texto += `• Tendência de alta, sugerindo força no movimento atual.\n`;
  } else if (tendencia === "Baixa") {
    texto += `• Tendência de baixa, indicando enfraquecimento do preço.\n`;
  } else {
    texto += `• Tendência lateral, indicando ausência de direção clara.\n`;
  }

  texto += `\nEsta análise é educacional e não constitui recomendação de investimento.`;

  return texto;
}

/**
 * Converte o período em texto legível
 * @param {string} period - Período (1d, 5d, 1mo, 1y, 2y, 5y)
 * @returns {string} - Texto do período
 */
export function periodoParaTexto(period) {
  const periodos = {
    '1d': '1 dia',
    '5d': '5 dias',
    '1mo': '1 mês',
    '3mo': '3 meses'
  };
  return periodos[period] || period;
}
