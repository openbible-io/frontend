import type { Plugin, SourceDescription } from "rolldown";
import MagicString from "magic-string";

export default function pluginReplace(dev: boolean): Plugin {
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
			s.replace(/import\s+.*\s+from\s+['"]esm-env['"]/g, "")
				.replace(/BROWSER/g, "true")
				.replace(/DEV/g, dev.toString());
			const res: SourceDescription = { code: s.toString() };
			if (sourcemap) res.map = s.generateMap({ hires: true });
			return res;
		},
	};
}
