// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
const langs = {
	eng: {
		name: "English",
		test: /^en(-|$)/,
		translation: () => import("./i18n/eng.json", { with: { type: "json" } }),
	},
	spa: {
		name: "Español",
		test: /^es(-|$)/,
		translation: () => import("./i18n/spa.json", { with: { type: "json" } }),
	},
	heb: {
		name: "עִברִית",
		test: /^he(-|$)/,
		translation: () => import("./i18n/heb.json", { with: { type: "json" } }),
	},
} as const;

export type Language = keyof typeof langs;
export type Translation = Awaited<
	ReturnType<(typeof langs)[Language]["translation"]>
>["default"];
export default langs;
