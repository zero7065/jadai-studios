export interface CountryDefaultConfig {
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  contactEmail: string;
  paymentGateway: 'paystack' | 'stripe';
  defaultLocale: string;
  placeholderBanner: string;
}

export const COUNTRY_DEFAULTS: Record<string, CountryDefaultConfig> = {
  NG: {
    currency: 'NGN',
    currencySymbol: '₦',
    phonePrefix: '+234',
    contactEmail: 'jadaistudiosoffcl@gmail.com',
    paymentGateway: 'paystack',
    defaultLocale: 'en-NG',
    placeholderBanner: 'Jadai Studios HQ • Jos, Nigeria (Building the floor)',
  },
  US: {
    currency: 'USD',
    currencySymbol: '$',
    phonePrefix: '+1',
    contactEmail: 'jadaistudiosoffcl@gmail.com',
    paymentGateway: 'paystack',
    defaultLocale: 'en-US',
    placeholderBanner: 'Jadai Studios Global Access (USD Gateway)',
  },
  GB: {
    currency: 'GBP',
    currencySymbol: '£',
    phonePrefix: '+44',
    contactEmail: 'jadaistudiosoffcl@gmail.com',
    paymentGateway: 'paystack',
    defaultLocale: 'en-GB',
    placeholderBanner: 'Jadai Studios UK & Europe Gateway',
  },
  IN: {
    currency: 'INR',
    currencySymbol: '₹',
    phonePrefix: '+91',
    contactEmail: 'jadaistudiosoffcl@gmail.com',
    paymentGateway: 'paystack',
    defaultLocale: 'en-IN',
    placeholderBanner: 'Jadai Studios Asia-Pacific Gateway',
  },
  DEFAULT: {
    currency: 'USD',
    currencySymbol: '$',
    phonePrefix: '',
    contactEmail: 'jadaistudiosoffcl@gmail.com',
    paymentGateway: 'paystack',
    defaultLocale: 'en-US',
    placeholderBanner: 'Jadai Studios International Network',
  },
};

export function resolveCountryDefaults(countryCode: string = 'NG'): CountryDefaultConfig {
  const code = (countryCode || 'NG').toUpperCase();
  return COUNTRY_DEFAULTS[code] || COUNTRY_DEFAULTS.DEFAULT;
}
