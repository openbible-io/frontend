import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";
import { Context as ServiceWorker, initService } from "../workers/workers.ts";
import langs, { Language } from "../../shared/i18n.ts";
import { getLang } from "../lib/i18n.ts";

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
export const systemTheme = atom(
	matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);

export const lang = createStore(
	"lang",
	getLang(),
	Object.keys(langs) as Language[],
);

//useEffect(() => {
//	//initService().then((w) => {
//	//	//if (import.meta.env.DEV) console.log(w);
//	//	//setWorker(w);
//	//});
//}, [translation]);
