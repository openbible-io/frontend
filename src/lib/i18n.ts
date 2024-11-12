import useLocalStorage from "./useLocalStorage.ts";
import langs, { type Dictionary, type Language } from "../../shared/i18n.ts";

export function template(res: string, args: Map<string, string>) {
	Object.entries(args).forEach(([k, v]) => {
		res.replaceAll(`{${k}}`, v);
	});
	return res;
}

export function getLang(): Language {
	for (const e of Object.entries(langs)) {
		const [id, dict] = e;
		// TODO: fix dict["2letter"]
		const re = new RegExp("en");
		if (re.test(navigator.language)) return id as Language;
	}

	return "eng";
}

export function useLang(): Language {
	const [lang, _] = useLocalStorage<string>("lang", getLang());
	if ((lang ?? "") in langs) return lang as Language;

	console.warn("unknown language", lang);
	return getLang();
}

// Source of truth for language is the local ui store.
export function useDict(): Dictionary {
	return langs[useLang()] as Dictionary;
}
