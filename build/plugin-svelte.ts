//// https://github.com/sveltejs/rollup-plugin-svelte/blob/master/index.js
//// ...but smaller and with types
import type { Plugin } from "rolldown";
import * as path from "node:path";
import { resolve } from "resolve.exports";
import { compile, compileModule } from "svelte/compiler";
import { dev } from "./config.ts";

const re = /\.svelte$/;
const modRe = /\.svelte(\.[^./\\]+)*\.(js|ts)$/;
// [filename]:[chunk]
const cache_emit = new Map();

export default {
	name: "svelte",

	/** Resolve uncompiled `.svelte` modules. */
	async resolveId(importee, importer, options) {
		if (cache_emit.has(importee)) return importee;
		if (!re.test(importer ?? "") || importee[0] == "." || importee[0] == "\0") {
			return null;
		}

		const parts = importee.split("/");
		let name = parts.shift();
		if (name && name[0] === "@") {
			name += `/${parts.shift()}`;
		}
		const entry = parts.join("/") || ".";

		try {
			// Old plugin manually used node module resolution which didn't care if
			// package.json[`exports`] itself contained `package.json`.
			// This plugin sadly does care, and there doesn't seem to be an easy
			// way around it...
			const pkgMod = await import(path.join(name, "package.json"), {
				with: { type: "json" },
			});
			const pkg = pkgMod.default;

			if (entry == "." && pkg?.svelte) {
				return this.resolve(path.join(name, pkg.svelte), importer, {
					skipSelf: true,
					...options,
				});
			}

			const resolved = await this.resolve(importee, importer, {
				skipSelf: true,
				...options,
			});
			if (resolved) return resolved;

			const resolved2 = resolve(pkg, entry, { conditions: ["svelte"] });
			if (resolved2) return resolved2;
		} catch {
			// no package.json
		}
		// not a svelte module
	},

	load(id) {
		return cache_emit.get(id) || null;
	},

	/** `.svelte` to `.js` and `.css` */
	transform(code, id) {
		if (modRe.test(id)) {
			const compiled = compileModule(code, {
				filename: id,
				dev,
			});
			(compiled.warnings || []).forEach(this.warn);

			return compiled.js;
		}

		if (!re.test(id)) return null;

		const filename = path.relative(Deno.cwd(), id);

		const compiled = compile(code, {
			css: "external",
			cssHash({ filename, name }) {
				return `${
					filename.replace(re, "").replace(/([^_0-9a-zA-Z]|src|index)/g, "")
				}-${name}`;
			},
			filename,
		});
		(compiled.warnings || []).forEach(this.warn);

		if (compiled.css && compiled.css.code) {
			const fname = id.replace(re, ".css");
			compiled.js.code += `\nimport ${JSON.stringify(fname)};\n`;
			cache_emit.set(fname, compiled.css);
		}

		return compiled.js;
	},
} as Plugin;
