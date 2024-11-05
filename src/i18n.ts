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
