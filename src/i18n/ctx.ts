import * as i18n from "@solid-primitives/i18n";
import { index } from './index';
import en from './en.json';

export type Locale = typeof index[number];
export type RawDictionary = typeof en;
export type Dictionary = i18n.Flatten<RawDictionary>;

export async function fetchTranslator(locale: Locale) {
  const dict: RawDictionary = await import(`./${locale}.json`);
	return i18n.translator(() => dict);
}
export const defaultDict = en;
export const languages = index;

export function navigatorLang(): Locale {
	const desired = navigator.language?.split('-')[0];
	return languages.find(l => l == desired) || 'en';
}
