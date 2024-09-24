//! These are the enabled languages.
import * as i18n from "@solid-primitives/i18n";
import en from './i18n/en-US.json';

export const languages = ['en-US'] as const;
export const defaultDict = en;

export type Locale = typeof languages[number];
export type RawDictionary = typeof en;
export type Dictionary = i18n.Flatten<RawDictionary>;

export async function fetchTranslator(locale: Locale) {
  const dict: RawDictionary = await import(`./i18n/${locale}.json`);
	return i18n.translator(() => dict);
}

export function navigatorLang(): Locale {
	const prefix = navigator.language?.split('-')[0];
	return languages.find(l => l == navigator.language || l.startsWith(prefix)) || 'en-US';
}
