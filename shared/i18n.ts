/*
 * BCP47 mapped to translation module and some metadata.
 *
 * TODO: Replace with `import("./i18n/en.json", { with: { type: "json" } }),`
 * and remove `impDeno` after:
 * - https://bugzilla.mozilla.org/show_bug.cgi?id=1736059
 * - https://github.com/rolldown/rolldown/issues/2758
 *
 *  TODO: Remove `dir` after https://bugzilla.mozilla.org/show_bug.cgi?id=1693576
 */
const translations = {
	en: {
		translation: () => {}, // base language already in this bundle
		dir: "ltr",
	},
	es: {
		translation: () => import("./i18n/es.json"),
		dir: "ltr",
	},
	he: {
		translation: () => import("./i18n/he.json"),
		dir: "rtl",
	},
	// mainland China and Singapore both use simplified chinese: zh-Hans
	//	- more commonly used are zh-CN and zh-SG
	// rest use traditional chinese: zh-Hant
	//	- more commonly used are zh-TW and zh-HK
} as const;
export type Locale = keyof typeof translations;

export function impDeno(t: Locale) {
	return import(`./i18n/${t}.json`, { with: { type: "json" } });
}

export const locales = Object.keys(translations) as Locale[];
export const base = "en";

type NonBaseTranslation = (typeof translations)[Exclude<Locale, typeof base>];
export type Translation = Awaited<
	ReturnType<NonBaseTranslation["translation"]>
>["default"];

export default translations;
