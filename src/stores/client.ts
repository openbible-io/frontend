import { createI18n, formatter } from "@nanostores/i18n";
import { persistentAtom } from "@nanostores/persistent";
import { createRouter } from "@nanostores/router";
import { Context as ServiceWorker, initService } from "../workers/workers.ts";
import translations, { base, type Locale, locales } from "../../shared/i18n.ts";

function createStore<T>(name: string, defaultValue: T, options: readonly T[]) {
	return persistentAtom<T>(
		name,
		defaultValue,
		{
			encode: JSON.stringify,
			decode(s) {
				const res = JSON.parse(s);
				if (options.includes(res)) return res;
				return defaultValue;
			},
		},
	);
}

export const themes = ["system", "dark", "light"] as const;
export type Theme = typeof themes[number];
export const theme = createStore("theme", "system", themes);

let locale = base;
for (const k of locales) {
	if (navigator.language.startsWith(k)) {
		locale = k;
		break;
	}
}
export const lang = createStore("lang", locale, locales);
export const format = formatter(lang);
/** Per-component */
export const i18n = createI18n(lang, {
	baseLocale: Object.keys(translations)[0] as Locale,
	async get(lang: Locale) {
		const t = await translations[lang];
		return t.default;
	},
});

export const router = createRouter({
	home: "/",
	about: "/about",
	pub: "/:pub",
	book: "/:pub/:book",
});

//useEffect(() => {
//	//initService().then((w) => {
//	//	//if (import.meta.env.DEV) console.log(w);
//	//	//setWorker(w);
//	//});
//}, [translation]);
