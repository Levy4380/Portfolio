import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import en from './en.json' with { type: 'json' };
import es from './es.json' with { type: 'json' };

export type Language = 'en' | 'es';

const catalogs = {
  en,
  es,
} as const satisfies Record<Language, typeof en>;

type Catalog = typeof en;

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? Leaves<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

export type TranslationKey = Leaves<Catalog>;

export type TranslationValues = Record<string, string | number>;

export const LANGUAGE_STORAGE_KEY = 'portfolio-language';

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
} | null>(null);
LanguageContext.displayName = 'LanguageContext';

export function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'es') return stored;
  } catch {
    /* Private mode can reject storage. */
  }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readStoredLanguage);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      /* Private mode can reject storage. The attribute still paints this visit. */
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (value === null) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return value;
}

function lookup(catalog: Catalog, key: string): string | undefined {
  let current: unknown = catalog;
  for (const part of key.split('.')) {
    if (typeof current !== 'object' || current === null || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function fill(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (token, name: string) => {
    const value = values[name];
    return value === undefined ? token : String(value);
  });
}

export function translate(
  language: Language,
  key: TranslationKey,
  values?: TranslationValues,
): string {
  const template = lookup(catalogs[language], key) ?? lookup(catalogs.en, key) ?? key;
  return fill(template, values);
}

export function useTranslation(language: Language) {
  return useCallback(
    (key: TranslationKey, values?: TranslationValues) => translate(language, key, values),
    [language],
  );
}
