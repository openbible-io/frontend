import type { Plugin } from "rolldown";
import { dirname, join, normalize } from "node:path";
import { base } from '../shared/i18n.ts';

const name = "json";

// TODO: remove once rolldown supports import attributes: https://github.com/rolldown/rolldown/issues/2758
export default {
	name,
	resolveId(id, importee) {
		if (id.endsWith(".json") && !id.endsWith(`${base}.json`)) return `\0${name}\0${id}\0${importee}`;
	},
	async load(id0) {
		if (!id0.startsWith(`\0${name}`)) return;
		const [_, __, id, importee] = id0.split("\0");

		// dirname("undefined") == "."
		const abspath = join(dirname(importee), id);
		this.addWatchFile(abspath);
		const fileName = normalize(id);
		const source = await Deno.readTextFile(abspath);
		this.emitFile({
			type: "asset",
			fileName,
			source,
			originalFileName: id,
		});

		return "";
	},
	// remove empty ""
	generateBundle: (_, bundle) => {
		Object.keys(bundle).forEach((key) => {
			if (bundle[key].type == "chunk" && bundle[key].code.length == 0) {
				delete bundle[key];
			}
		});
	},
} as Plugin;
