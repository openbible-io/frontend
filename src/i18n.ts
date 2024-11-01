import type { Cell } from "tinybase";
import { useValue } from "./stores/client.ts";

import eng from "./i18n/eng.json" with { type: "json" };
//import spa from "./i18n/spa.json";
//import heb from "./i18n/heb.json";

// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
export const langs = {
	eng,
	//spa,
	//heb,
} as const;

export type Language = keyof typeof langs;
export type Dictionary = typeof langs[Language];

export function getLang(): Language {
	for (const e of Object.entries(langs)) {
		const [id, dict] = e;
		const re = new RegExp(dict["2letter"]);
		if (re.test(navigator.language)) return id as Language;
	}

	return "eng";
}

// Source of truth for language is the local ui store.
export function useDict(): Dictionary {
	const lang = useValue("lang", "shared");
	return langs[lang as Language];
}

export function template(dict: Dictionary, verb: Cell, noun: Cell): string {
	const v = dict.verbs[verb.toString() as keyof Dictionary["verbs"]] ??
		verb.toString();
	const n = dict.nouns[noun.toString() as keyof Dictionary["nouns"]] ??
		noun.toString();

	return v.replaceAll("{}", n);
}
