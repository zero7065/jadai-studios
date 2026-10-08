'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils/format';

export type SupportedCurrency = 'USD' | 'NGN';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  toggleCurrency: () => void;
  formatPrice: (usd: number, ngn?: number) => string;
  formatDual: (usd: number, ngn?: number) => { main: string; alt: string };
  usdToNgnRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const DEFAULT_USD_NGN_RATE = 1500; // Realistic conversion rate

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jadai_currency_pref');
      if (stored === 'NGN' || stored === 'USD') return stored;
    }
    return 'USD'; // International default
  });

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jadai_currency_pref', c);
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'NGN' : 'USD');
  };

  const formatPrice = (usd: number, ngn?: number): string => {
    const effectiveNgn = ngn ?? Math.round(usd * DEFAULT_USD_NGN_RATE);
    if (currency === 'USD') {
      return formatCurrency(usd, 'USD');
    }
    return formatCurrency(effectiveNgn, 'NGN');
  };

  const formatDual = (usd: number, ngn?: number): { main: string; alt: string } => {
    const effectiveNgn = ngn ?? Math.round(usd * DEFAULT_USD_NGN_RATE);
    if (currency === 'USD') {
      return {
        main: formatCurrency(usd, 'USD'),
        alt: formatCurrency(effectiveNgn, 'NGN'),
      };
    }
    return {
      main: formatCurrency(effectiveNgn, 'NGN'),
      alt: formatCurrency(usd, 'USD'),
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatDual,
        usdToNgnRate: DEFAULT_USD_NGN_RATE,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'USD' as SupportedCurrency,
      setCurrency: () => {},
      toggleCurrency: () => {},
      formatPrice: (usd: number) => `$${usd}`,
      formatDual: (usd: number) => ({ main: `$${usd}`, alt: `₦${usd * 1500}` }),
      usdToNgnRate: DEFAULT_USD_NGN_RATE,
    };
  }
  return context;
}

export default CurrencyProvider;
