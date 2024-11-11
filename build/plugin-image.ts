import type { Plugin } from "rolldown";
import { contentType } from "@std/media-types";
import { extname } from "node:path";

let cwd = Deno.cwd();

export default {
	name: "image",
	buildStart(opts) {
		if (opts.cwd) cwd = opts.cwd;
	},
	resolveId(id) {
		const ty = contentType(extname(id));
		if (ty?.startsWith("image/")) return id;
	},
	async load(id) {
		const ty = contentType(extname(id));
		if (!ty?.startsWith("image/")) return;

		this.addWatchFile(id);

		const relpath = id.replace(cwd, "");

		const source = await Deno.readTextFile(id);
		this.emitFile({ type: "asset", name: relpath, source });

		return JSON.stringify(relpath);
	},
} as Plugin;
