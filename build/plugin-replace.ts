import type { Plugin, SourceDescription } from "rolldown";
import MagicString from "magic-string";

export default function pluginReplace(replacements: Map<string, string>): Plugin {
	let sourcemap = false;

	return {
		name: "fix esm-env",
		renderStart(opts) {
			sourcemap = Boolean(opts.sourcemap);
		},
		// Dunno if this is the best hook to use.
		// @rollup/plugin-replace uses `renderChunk` and `transform`.
		transform(code, id) {
			if (!id.match(/\.[tj]s/)) return code;

			const s = new MagicString(code);
			Object.entries(replacements).forEach(([k, v]) => {
				const re = new RegExp(k, 'g');
				s.replace(re, v);
			});
			const res: SourceDescription = { code: s.toString() };
			if (sourcemap) res.map = s.generateMap({ hires: true });
			return res;
		},
	};
}
