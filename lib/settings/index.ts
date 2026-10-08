import { supabaseAdmin } from '../supabase/admin';
import { resolveCountryDefaults, COUNTRY_DEFAULTS } from './country-defaults';

// In-memory runtime cache for admin settings to prevent excessive DB calls
const settingsCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export function invalidateSettingsCache(): void {
  settingsCache.clear();
}

/**
 * Retrieves a setting from the admin_settings table, falling back to process.env or provided default.
 */
export async function getSetting(key: string, fallback: string = ''): Promise<string> {
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  // Check env variable fallback first if present
  const envKey = key.toUpperCase();
  if (process.env[envKey]) {
    settingsCache.set(key, { value: process.env[envKey] as string, timestamp: Date.now() });
    return process.env[envKey] as string;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (!error && data && data.value && !data.value.startsWith('[SET_IN_')) {
      settingsCache.set(key, { value: data.value, timestamp: Date.now() });
      return data.value;
    }
  } catch (err) {
    // If DB is unreachable, proceed to fallback gracefully
  }

  return fallback;
}

/**
 * Returns user country code (defaults to 'NG').
 */
export async function getUserCountry(userId?: string): Promise<string> {
  if (!userId) {
    return 'NG';
  }

  try {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('country_code')
      .eq('id', userId)
      .maybeSingle();

    return data?.country_code || 'NG';
  } catch {
    return 'NG';
  }
}

/**
 * Returns country-appropriate default value for standard keys.
 */
export async function getCountryDefault(key: string, countryCode: string = 'NG'): Promise<string> {
  const config = resolveCountryDefaults(countryCode);

  switch (key) {
    case 'currency':
    case 'default_currency':
    case 'default_currency_ngn':
      return config.currency;
    case 'contact_email':
    case 'admin_email':
      return config.contactEmail;
    case 'phone_prefix':
      return config.phonePrefix;
    default:
      return '';
  }
}

/**
 * Core implementation of the "Ask, Don't Assume" principle.
 * If setting is missing or still set to a [SET_IN_...] placeholder:
 * - Admin sees a prompt string asking for it.
 * - Public user sees a country-appropriate default.
 */
export async function getSettingOrPrompt(
  key: string,
  purpose: string
): Promise<{
  value: string;
  source: 'admin' | 'country_default' | 'placeholder';
  prompt_if_missing: string;
}> {
  const prompt_if_missing = `You haven't set your ${key} yet. Add it in Admin Settings to enable ${purpose}.`;

  // 1. Check database setting
  try {
    const { data } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (data?.value && !data.value.startsWith('[SET_IN_') && data.value.trim() !== '') {
      return {
        value: data.value,
        source: 'admin',
        prompt_if_missing,
      };
    }
  } catch (err) {
    // fallback if DB is offline
  }

  // 2. Check process.env
  const envVal = process.env[key.toUpperCase()];
  if (envVal && !envVal.startsWith('[SET_IN_') && envVal.trim() !== '') {
    return {
      value: envVal,
      source: 'admin',
      prompt_if_missing,
    };
  }

  // 3. Fall back to Nigerian / country default
  const countryDefault = await getCountryDefault(key, 'NG');
  if (countryDefault) {
    return {
      value: countryDefault,
      source: 'country_default',
      prompt_if_missing,
    };
  }

  // 4. Return placeholder with actionable prompt
  return {
    value: `[SET_IN_ADMIN_SETTINGS_${key.toUpperCase()}]`,
    source: 'placeholder',
    prompt_if_missing,
  };
}
