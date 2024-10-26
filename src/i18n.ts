import eng from "./i18n/eng.json";
import spa from "./i18n/spa.json";
import heb from "./i18n/heb.json";
import { computed, signal } from "@preact/signals";

// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
export const langs = {
	eng,
	spa,
	heb,
} as const;

export type Language = keyof typeof langs;
export type Dictionary = typeof langs["eng"];

function navigatorLang(): Language {
	// Spec allows 3 letter codes.
	for (const e of Object.entries(langs)) {
		const [id, dict] = e;
		const re = new RegExp(dict["2letter"]);
		if (re.test(navigator.language)) return id;
	}

	return "eng";
}

export const lang = signal(navigatorLang());
const dict = computed(() => langs[lang.value]);
export default dict;
