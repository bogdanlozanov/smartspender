import { APP_CURRENCY } from '@/src/constants/app';

export const formatCurrency = (value: number | null, currency: string = APP_CURRENCY) => {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseCurrency = (input: string | null): number | null => {
  if (!input) {
    return null;
  }

  const normalized = input.replace(/[^0-9,.-]+/g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);

  return Number.isFinite(value) ? value : null;
};

export const formatDate = (iso: string | null) => {
  if (!iso) {
    return '—';
  }

  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const toISODate = (input: string | null): string | null => {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/[.]/g, '/').replace(/-/g, '/');
  const parts = normalized.split('/');

  if (parts.length === 3) {
    const [a, b, c] = parts;
    // Handle DD/MM/YYYY and YYYY/MM/DD
    if (a.length === 4) {
      // YYYY/MM/DD
      const year = Number.parseInt(a, 10);
      const month = Number.parseInt(b, 10) - 1;
      const day = Number.parseInt(c, 10);
      const date = new Date(year, month, day);
      return Number.isFinite(date.getTime()) ? date.toISOString() : null;
    }

    const day = Number.parseInt(a, 10);
    const month = Number.parseInt(b, 10) - 1;
    const year = Number.parseInt(c, 10);
    const date = new Date(year, month, day);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  const fallback = new Date(trimmed);
  return Number.isFinite(fallback.getTime()) ? fallback.toISOString() : null;
};
