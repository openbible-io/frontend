import langs, { type Dictionary } from "../../shared/i18n.ts";
import { useValue } from "../stores/client.ts";

export function template(res: string, args: Map<string, string>) {
	Object.entries(args).forEach(([k, v]) => {
		res.replaceAll(`{${k}}`, v);
	});
	return res;
}

// Source of truth for language is the local ui store.
export function useDict(): Dictionary {
	const lang = useValue("lang");

	return langs[lang] as Dictionary;
}
