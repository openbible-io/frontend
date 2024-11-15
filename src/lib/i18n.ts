import langs, { type Language } from "../../shared/i18n.ts";

export function getLang(): Language {
	for (const e of Object.entries(langs)) {
		const [id, { test }] = e;
		if (test.test(navigator.language)) return id as Language;
	}

	return Object.keys(langs)[0] as Language;
}
