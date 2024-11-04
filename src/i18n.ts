import type { Cell } from "tinybase";
import useLocalStorage from './hooks/useLocalStorage.ts';

import eng from "./i18n/eng.json" with { type: "json" };
import spa from "./i18n/spa.json" with { type: "json" };;
import heb from "./i18n/heb.json" with { type: "json" };;

// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
export const langs = {
	eng,
	spa,
	heb,
} as const;

export type Language = keyof typeof langs;
export type Dictionary = typeof langs['eng'];

export function getLang(): Language {
	for (const e of Object.entries(langs)) {
		const [id, dict] = e;
		const re = new RegExp(dict["2letter"]);
		if (re.test(navigator.language)) return id as Language;
	}

	return "eng";
}

export function useLang(): Language {
	const [lang, _] = useLocalStorage<string>('lang', getLang());
	if ((lang ?? '') in langs) return lang as Language;

	console.warn('unknown language', lang);
	return getLang();
}

// Source of truth for language is the local ui store.
export function useDict(): Dictionary {
	return langs[useLang()] as Dictionary;
}

export function template(dict: Dictionary, verb: Cell, noun: Cell): string {
	const v = dict.verbs[verb.toString() as keyof Dictionary["verbs"]] ??
		verb.toString();
	const n = dict.nouns[noun.toString() as keyof Dictionary["nouns"]] ??
		noun.toString();

	return v.replaceAll("{}", n);
}
