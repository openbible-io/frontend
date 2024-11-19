// Extracts base translation to JSON
import type { Plugin } from "rolldown";
import { type Messages, messagesToJSON } from "@nanostores/i18n";

let messages: Messages[] = [];

export default {
	options() {
		messages = [];
	},
	async transform(code, id, { moduleType }) {
		if (moduleType == "tsx" && code.match(/export\s+const\s+i18n\s+/)) {
			const f = await import(id);
			if (f.i18n.get) messages.push(f.i18n);
		}
	},
	async generateBundle() {
		const languages = await import("../shared/i18n.ts");
		const lang = await languages.default[languages.base];
		const json = {
			...lang.default,
			...messagesToJSON(...messages),
		};
		this.emitFile({
			type: "asset",
			source: JSON.stringify(json),
			fileName: "i18n/base.json",
		});
	},
	
} as Plugin;
