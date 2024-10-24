//! These are the enabled languages.
import * as i18n from '@solid-primitives/i18n';
// TODO: remove this as default. ship default from server based on client HTTP header
import en from './i18n/eng.json';

// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
const langs = {
	"en": "eng",
	"es": "spa",
	"he": "heb",
} as const;

export type Language = typeof langs[keyof typeof langs];
export const languages = Object.values(langs) as Language[];
export const defaultDict = en;

export type Locale = typeof languages[number];
export type RawDictionary = typeof en;
export type Dictionary = i18n.Flatten<RawDictionary>;

export async function fetchTranslator(locale: Locale) {
	const dict: RawDictionary = await import(`./i18n/${locale}.json`);
	return i18n.translator(() => dict);
}

export function navigatorLang(): Locale {
	const alpha = navigator.language?.split('-')[0];
	// Spec allows 3 letter codes.
	if (languages.includes(alpha as Language)) return alpha as Language;

	return langs[alpha as keyof typeof langs] ?? 'eng';
}
