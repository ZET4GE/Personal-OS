// cn() — combina clases Tailwind de forma segura
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

const CURRENCY_SYMBOLS: Record<string, string> = { ARS: '$', USD: 'US$', EUR: '€' }

export function formatCurrency(amount: number, currency: string): string {
  const symbol    = CURRENCY_SYMBOLS[currency] ?? currency
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${formatted}`
}

export function isOverdue(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false
  return new Date(dueDateStr + 'T23:59:59') < new Date()
}

export function generateAlertId(type: string, message: string): string {
  return `${type}_${message
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80)}`
}
