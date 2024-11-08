import type { Plugin, SourceDescription } from "rolldown";
import MagicString from "magic-string";

// TODO: replace with ReplacePlugin after source map support
// https://github.com/rolldown/rolldown/issues/2057
export default function pluginReplace(
	replacements: { [k: string]: string },
): Plugin {
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
				const re = new RegExp(k, "g");
				s.replace(re, v);
			});
			const res: SourceDescription = { code: s.toString() };
			if (sourcemap) res.map = s.generateMap({ hires: true });
			return res;
		},
	};
}
