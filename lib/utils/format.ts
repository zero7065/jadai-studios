/**
 * Formatting utilities for Jadai Studios
 */

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  if (currency.toUpperCase() === 'NGN') {
    return `₦${amount.toLocaleString('en-NG')}`;
  }
  if (currency.toUpperCase() === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  if (currency.toUpperCase() === 'GBP') {
    return `£${amount.toLocaleString('en-GB')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(text: string, maxLen: number = 80): string {
  if (!text || text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}
