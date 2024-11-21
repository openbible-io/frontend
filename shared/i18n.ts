// There are currently two standards available,
// - [IANA](http://www.iana.org/assignments/language-subtag-registry)
//	- Adds multiple tags to the base tag
// - [ISO-639-3](https://iso639-3.sil.org/)
//	- gives dialects separate tags
//
// We use the IANA standard because that's what the browser `Intl` uses.

// TODO: Replace with `import("./i18n/en.json", { with: { type: "json" } }),`
// and remove `impDeno` after:
// - https://bugzilla.mozilla.org/show_bug.cgi?id=1736059
// - https://github.com/rolldown/rolldown/issues/2758
const translations = {
	en: () => {}, // base language needs no import.
	es: () => import("./i18n/es.json"),
	he: () => import("./i18n/he.json"),
	// mainland China and Singapore both use simplified chinese: zh-Hans
	//	- more commonly used are  zh-CN and zh-SG
	// rest use traditional chinese: zh-Hant
	//	- more commonly used are zh-TW and zh-HK
} as const;

export function impDeno(t: Locale) {
	return import(`./i18n/${t}.json`, { with: { type: "json" } });
}

// FF doesn't support https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo
export function dir(loc: Locale) {
	switch (loc) {
		case "he":
			return "rtl";
		default:
			return "ltr";
	}
}

export const locales = Object.keys(translations) as Locale[];
export const base = "en";

export type Locale = keyof typeof translations;
export type Translation = Awaited<
	ReturnType<(typeof translations)[Exclude<Locale, typeof base>]>
>["default"];

export default translations;
