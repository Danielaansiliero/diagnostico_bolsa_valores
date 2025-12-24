/**
 * Cálculos financeiros do MVP
 */

/**
 * Calcula o retorno acumulado do período
 * @param {number[]} precos - Array de preços de fechamento
 * @returns {number} - Retorno como decimal (0.38 = 38%)
 */
export function calcularRetorno(precos) {
  if (!precos || precos.length < 2) return 0;

  const precoInicial = precos[0];
  const precoFinal = precos[precos.length - 1];

  return (precoFinal - precoInicial) / precoInicial;
}

/**
 * Calcula a volatilidade (desvio padrão dos retornos diários)
 * @param {number[]} precos - Array de preços de fechamento
 * @returns {number} - Volatilidade como decimal
 */
export function calcularVolatilidade(precos) {
  if (!precos || precos.length < 2) return 0;

  const retornos = [];

  for (let i = 1; i < precos.length; i++) {
    const retornoDiario = (precos[i] - precos[i - 1]) / precos[i - 1];
    retornos.push(retornoDiario);
  }

  const media = retornos.reduce((acc, val) => acc + val, 0) / retornos.length;
  const variancia = retornos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / retornos.length;

  return Math.sqrt(variancia);
}

/**
 * Classifica a volatilidade em texto
 * @param {number} vol - Valor da volatilidade
 * @returns {string} - "Baixa", "Moderada" ou "Alta"
 */
export function classificarVolatilidade(vol) {
  if (vol < 0.01) return "Baixa";
  if (vol < 0.02) return "Moderada";
  return "Alta";
}

/**
 * Calcula a média móvel simples
 * @param {number[]} precos - Array de preços de fechamento
 * @param {number} periodo - Número de dias para a média
 * @returns {number} - Valor da média móvel
 */
export function calcularMediaMovel(precos, periodo = 50) {
  if (!precos || precos.length < periodo) {
    return precos[precos.length - 1] || 0;
  }

  const slice = precos.slice(-periodo);
  const soma = slice.reduce((acc, val) => acc + val, 0);
  return soma / slice.length;
}

/**
 * Identifica a tendência do ativo
 * @param {number[]} precos - Array de preços de fechamento
 * @returns {string} - "Alta", "Baixa" ou "Lateral"
 */
export function identificarTendencia(precos) {
  if (!precos || precos.length < 2) return "Lateral";

  const precoAtual = precos[precos.length - 1];
  const media50 = calcularMediaMovel(precos, Math.min(50, precos.length));

  if (precoAtual > media50 * 1.01) return "Alta";
  if (precoAtual < media50 * 0.99) return "Baixa";
  return "Lateral";
}
