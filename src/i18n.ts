import English from '../public/i18n/eng.json' with { type: 'json' };
// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
export const langs = ['eng', 'spa', 'heb'] as const;
export type Language = typeof langs[number];
// Can remove Partial<> once all translations have same schema.
export type Dictionary = Partial<typeof English>;

export function href(lang: Language): string {
	return `/i18n/${lang}.json`;
}

export async function fetchLang(lang: Language): Promise<Dictionary> {
	const resp = await fetch(href(lang));
	return resp.json() as Dictionary;
}

export function template(res: string, args: Map<string, string>) {
	Object.entries(args).forEach(([k, v]) => {
		res.replaceAll(`{${k}}`, v);
	});
	return res;
}

//export function getLang(): Language {
//	for (const e of Object.entries(langs)) {
//		const [id, dict] = e;
//		const re = new RegExp(dict["2letter"]);
//		if (re.test(navigator.language)) return id as Language;
//	}
//
//	return "eng";
//}

//import type { Cell } from "tinybase";
//import useLocalStorage from './hooks/useLocalStorage.ts';

//export function useLang(): Language {
//	const [lang, _] = useLocalStorage<string>('lang', getLang());
//	if ((lang ?? '') in langs) return lang as Language;
//
//	console.warn('unknown language', lang);
//	return getLang();
//}
//
//// Source of truth for language is the local ui store.
//export function useDict(): Dictionary {
//	return langs[useLang()] as Dictionary;
//}
//
//export function template(dict: Dictionary, verb: Cell, noun: Cell): string {
//	const v = dict.verbs[verb.toString() as keyof Dictionary["verbs"]] ??
//		verb.toString();
//	const n = dict.nouns[noun.toString() as keyof Dictionary["nouns"]] ??
//		noun.toString();
//
//	return v.replaceAll("{}", n);
//}
