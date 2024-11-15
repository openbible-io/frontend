import { useEffect, useMemo, useState } from 'preact/hooks';
import langs, { Language, type Translation } from "../../shared/i18n.ts";
import { useValue } from "../stores/client.ts";

export function template(res: string, args: Map<string, string>) {
	Object.entries(args).forEach(([k, v]) => {
		res.replaceAll(`{${k}}`, v);
	});
	return res;
}

export function getLang(): Language {
	for (const e of Object.entries(langs)) {
		const [id, { test }] = e;
		if (test.test(navigator.language)) return id as Language;
	}

	return Object.keys(langs)[0] as Language;
}

export function useLang(): Language {
	const res = useValue("lang");
	if (res && res in langs) return res as Language;

	return getLang();
}

// Source of truth for language is the local ui store.
export function useTranslation(): Translation | undefined {
	const lang = useLang();
	const [translation, setTranslation] = useState<Translation>();

	useMemo(() => {
		console.log("fetching", lang);
		langs[lang].translation().then(t => setTranslation(t.default));
	}, [lang]);

	return translation;
}
