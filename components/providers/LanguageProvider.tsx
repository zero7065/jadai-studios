'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudioAudio } from '../../lib/watermark';

export const ALL_LOCALES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'ha', name: 'Hausa', native: 'Harshen Hausa' },
  { code: 'yo', name: 'Yoruba', native: 'Èdè Yorùbá' },
  { code: 'ig', name: 'Igbo', native: 'Asụsụ Igbo' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
] as const;

export type SupportedLanguage = (typeof ALL_LOCALES)[number]['code'];

export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const BASE_DICTIONARY: Record<string, string> = {
  'nav.home': 'Home',
  'nav.studio': 'Studio',
  'nav.about': 'About',
  'nav.services': 'Services',
  'nav.work': 'Work',
  'hero.badge': 'JADAI STUDIOS • SYSTEMS & INTELLIGENCE',
  'hero.title': 'Build Different',
  'hero.subtitle': 'Bento-architected high-dimensional intelligence, creation tools, and luxury interactive platforms.',
  'hero.explore': 'Explore Systems',
  'hero.consult': 'Request Architecture',
  'portrait.badge': 'PRINCIPAL ARCHITECT',
  'theme.light': 'Architectural Light',
  'theme.dark': 'Void Obsidian Dark',
};

// Specialized translations for primary tiers
const MULTI_TRANSLATIONS: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  es: {
    'nav.home': 'Inicio',
    'nav.studio': 'Estudio',
    'nav.about': 'Nosotros',
    'nav.services': 'Servicios',
    'nav.work': 'Proyectos',
    'hero.badge': 'ESTUDIOS JADAI • SISTEMAS E INTELIGENCIA',
    'hero.title': 'Construye Diferente',
    'hero.subtitle': 'Inteligencia de alta dimensión con arquitectura Bento, herramientas soberanas y plataformas de lujo.',
    'hero.explore': 'Explorar Sistemas',
    'hero.consult': 'Solicitar Arquitectura',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.studio': 'Studio',
    'nav.about': 'À Propos',
    'nav.services': 'Services',
    'nav.work': 'Réalisations',
    'hero.badge': 'STUDIOS JADAI • SYSTÈMES ET INTELLIGENCE',
    'hero.title': 'Bâtir Différemment',
    'hero.subtitle': 'Intelligence haute dimension conçue en Bento, outils souverains et interfaces interactives de luxe.',
    'hero.explore': 'Explorer Les Systèmes',
    'hero.consult': 'Demander Une Architecture',
  },
  de: {
    'nav.home': 'Start',
    'nav.studio': 'Studio',
    'nav.about': 'Über Uns',
    'nav.services': 'Dienste',
    'nav.work': 'Arbeiten',
    'hero.badge': 'JADAI STUDIOS • SYSTEME & INTELLIGENZ',
    'hero.title': 'Baue Anders',
    'hero.subtitle': 'Bento-strukturierte Hochdimensions-Intelligenz, souveräne Werkzeuge und luxuriöse Plattformen.',
    'hero.explore': 'Systeme Erkunden',
    'hero.consult': 'Architektur Anfordern',
  },
  ha: {
    'nav.home': 'Gida',
    'nav.studio': 'Dakin Aiki',
    'nav.about': 'Game Da Mu',
    'nav.services': 'Ayyuka',
    'nav.work': 'Ayyukan da aka gama',
    'hero.badge': 'JADAI STUDIOS • FASAHAR ZAMANI',
    'hero.title': 'Gina Da Dabara',
    'hero.subtitle': 'Fasahar zamani da kayan aikin gina software mai karko daga yankin Jos.',
  },
  yo: {
    'nav.home': 'Ilé',
    'nav.studio': 'Ilé-iṣẹ́',
    'nav.about': 'Nípa Wa',
    'nav.services': 'Àwọn Iṣẹ́',
    'nav.work': 'Àwọn Àṣeyọrí',
    'hero.badge': 'JADAI STUDIOS • ỌPỌLỌ ÀTI ÌRÒ',
    'hero.title': 'Kọ́ Nǹkan Lọtọọtọ',
    'hero.subtitle': 'Ìmọ̀ ẹ̀rọ tó tayọ fún àwọn olùkọ́lé tó lágbára.',
  },
  ig: {
    'nav.home': 'Ụlọ',
    'nav.studio': 'Ụlọ Ọrụ',
    'nav.about': 'Maka Anyị',
    'nav.services': 'Ọrụ Anyị',
    'nav.work': 'Ọrụ Emere',
    'hero.badge': 'JADAI STUDIOS • AMAMIHE NA NKÀ',
    'hero.title': 'Wuo Nke Dị Iche',
    'hero.subtitle': 'Teknụzụ dị elu maka ndị injinia nwere ọhụụ.',
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [detectedLocale, setDetectedLocale] = useState<typeof ALL_LOCALES[number] | null>(null);
  const [showDetectionBanner, setShowDetectionBanner] = useState(false);

  useEffect(() => {
    // 1. Check saved language preference in localStorage
    try {
      const saved = localStorage.getItem('jadai_language_pref') as SupportedLanguage;
      if (saved && ALL_LOCALES.some((l) => l.code === saved)) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
        if (saved === 'ar' || saved === 'he' || saved === 'fa') {
          document.documentElement.dir = 'rtl';
        } else {
          document.documentElement.dir = 'ltr';
        }
        return;
      }
    } catch {}

    // 2. Auto-detect user language region
    try {
      const candidateList: string[] = [];
      if (navigator.languages && navigator.languages.length > 0) {
        candidateList.push(...navigator.languages);
      }
      if (navigator.language) {
        candidateList.push(navigator.language);
      }

      let matchedLocale: (typeof ALL_LOCALES)[number] | undefined;
      for (const raw of candidateList) {
        if (!raw) continue;
        const normalized = raw.toLowerCase();
        const primary = normalized.split('-')[0];
        matchedLocale = ALL_LOCALES.find((l) => l.code === normalized || l.code === primary);
        if (matchedLocale) break;
      }

      if (matchedLocale) {
        setLanguageState(matchedLocale.code);
        document.documentElement.lang = matchedLocale.code;
        if (matchedLocale.code === 'ar' || matchedLocale.code === 'he' || matchedLocale.code === 'fa') {
          document.documentElement.dir = 'rtl';
        } else {
          document.documentElement.dir = 'ltr';
        }
      }
    } catch {
      // Fallback stays 'en'
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('jadai_language_pref', lang);
      document.documentElement.lang = lang;
      if (lang === 'ar' || lang === 'he' || lang === 'fa') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    } catch {}
    setShowDetectionBanner(false);
    StudioAudio.playClick();
  };

  const handleAcceptDetected = () => {
    if (detectedLocale) {
      setLanguage(detectedLocale.code);
      StudioAudio.playSuccessArpeggio();
    }
  };

  const handleDeclineDetected = () => {
    localStorage.setItem('lang_pref_asked', 'true');
    setShowDetectionBanner(false);
    StudioAudio.playClick();
  };

  const t = (key: string): string => {
    if (MULTI_TRANSLATIONS[language]?.[key]) {
      return MULTI_TRANSLATIONS[language]![key];
    }
    return BASE_DICTIONARY[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}

      {/* Auto-Detection Banner (Bottom-Right) — Section E.2 */}
      {showDetectionBanner && detectedLocale && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[150] max-w-sm p-4 rounded-2xl glass-heavy border border-[rgba(201,168,76,0.35)] shadow-2xl backdrop-blur-2xl text-xs font-mono space-y-2.5 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-center justify-between text-[#e8c96a]">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Locale Auto-Detection
            </span>
          </div>
          <p className="text-[#c4c0bb] leading-relaxed">
            We detected your preferred language is{' '}
            <strong className="text-[#f5f3f0]">{detectedLocale.name} ({detectedLocale.native})</strong>. Switch interface?
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleDeclineDetected}
              className="px-2.5 py-1 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#c4c0bb] transition-colors cursor-pointer"
            >
              Keep English
            </button>
            <button
              onClick={handleAcceptDetected}
              className="px-3 py-1 rounded-lg bg-[#C9A84C] text-[#050404] font-bold hover:bg-[#e8c96a] transition-colors cursor-pointer shadow"
            >
              Switch to {detectedLocale.name}
            </button>
          </div>
        </aside>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
