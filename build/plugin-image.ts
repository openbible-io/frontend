import type { Plugin } from "rolldown";
import { contentType } from "@std/media-types";
import { dirname, extname, join, normalize } from "node:path";

const name = "image";

export default {
	name,
	resolveId(id, importee) {
		const ty = contentType(extname(id));
		if (ty?.startsWith("image/")) return `\0${name}\0${id}\0${importee}`;
	},
	async load(id0) {
		if (!id0?.startsWith(`\0${name}`)) return;
		const [_, __, id, importee] = id0.split("\0");

		this.addWatchFile(id);

		// dirname("undefined") == "."
		const path = join(dirname(importee), id);
		const source = await Deno.readTextFile(path);

		this.emitFile({
			type: "asset",
			name: normalize(id),
			source,
			originalFileName: id,
		});

		return JSON.stringify(path);
	},
} as Plugin;
