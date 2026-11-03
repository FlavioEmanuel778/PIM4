// Converte um parâmetro de rota em id numérico válido (ou null).
export function toId(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
