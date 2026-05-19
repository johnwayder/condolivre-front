export const formatBRLFromCents = (cents: number): string =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatPercent = (fraction: number, digits = 2): string =>
  `${(fraction * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: digits,
  })}%`;

export const reaisToCents = (reais: number): number => Math.round(reais * 100);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
