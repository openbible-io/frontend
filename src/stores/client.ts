import { ComponentsJSON, createI18n, formatter } from "@nanostores/i18n";
import { persistentAtom } from "@nanostores/persistent";
import { createRouter } from "@nanostores/router";
import { Context as ServiceWorker, initService } from "../workers/workers.ts";
import translations, {
	base,
	dir,
	type Locale,
	locales,
	Translation,
} from "../../shared/i18n.ts";

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

export let locale: Locale = base;
for (const k of locales) {
	if (navigator.language.startsWith(k)) {
		locale = k;
		break;
	}
}
export const lang = createStore("lang", locale, locales);
lang.subscribe((l) => {
	document.documentElement.dir = dir(l);
	document.documentElement.lang = l;
});

export const defaultUsername = () => `user${Math.round(Math.random() * 3000)}`;
export const username = persistentAtom<string>("username", defaultUsername());

export const format = formatter(lang);
/** Per-component */
export const i18n = createI18n(lang, {
	baseLocale: base,
	async get(lang, components): Promise<ComponentsJSON> {
		if (lang == base) throw Error("base translation is already in bundle");

		const t = (await translations[lang]()).default;
		(components as (keyof Translation)[]).forEach((c) => {
			if (!(c in t)) t[c] = {}; // without this no components will load
		});
		return t;
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
