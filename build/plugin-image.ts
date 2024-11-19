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


		// dirname("undefined") == "."
		const abspath = join(dirname(importee), id);
		this.addWatchFile(abspath);
		const source = await Deno.readTextFile(abspath);

		this.emitFile({
			type: "asset",
			name: normalize(id),
			source,
			originalFileName: id,
		});

		return JSON.stringify(abspath);
	},
} as Plugin;
