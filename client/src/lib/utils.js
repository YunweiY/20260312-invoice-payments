import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// format the amount value to a string with 2 decimal places
export function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '0.00';
  }

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function toIso8601(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    // Keep original value so backend validation can return a clear error.
    return value;
  }

  return date.toISOString();
}
