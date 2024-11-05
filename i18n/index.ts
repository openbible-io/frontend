// This file must run in deno and the browser.

// Browsers use https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.1
// We use https://www.loc.gov/standards/iso639-2/php/code_list.php
const langs = {
	eng: () => import('./eng.json', { with: { type: "json" } }),
	spa: () => import('./spa.json', { with: { type: "json" } }),
	heb: () => import('./heb.json', { with: { type: "json" } }),
} as const;

export type Language = keyof typeof langs;
// Can remove Partial<> once all translations have same schema.
export type Dictionary = Partial<Awaited<typeof langs[Language]>>;
export default langs;
