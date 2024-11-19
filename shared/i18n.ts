// There are currently two standards available,
// - [IANA](http://www.iana.org/assignments/language-subtag-registry)
//	- Adds multiple tags to the base tag
// - [ISO-639-3](https://iso639-3.sil.org/)
//	- gives dialects separate tags
//
// We use the IANA standard because that's what the browser `Intl` uses.

const translations = {
	en: import("./i18n/en.json", { with: { type: "json" } }),
	es: import("./i18n/es.json", { with: { type: "json" } }),
	he: import("./i18n/he.json", { with: { type: "json" } }),
	// mainland China and Singapore both use simplified chinese: zh-Hans
	//	- more commonly used are  zh-CN and zh-SG
	// rest use traditional chinese: zh-Hant
	//	- more commonly used are zh-TW and zh-HK
} as const;

export type Locale = keyof typeof translations;
export type Translation = Awaited<(typeof translations)[Locale]>["default"];

export const locales = Object.keys(translations) as Locale[];
export const base = locales[0];
export default translations;
