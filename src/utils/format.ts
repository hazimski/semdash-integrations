
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) {
    return '0';
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return Math.round(num).toString(); // Round numbers less than 1000 to whole numbers
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return `$${value.toFixed(2)}`;
}

