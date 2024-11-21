import type { Plugin } from "rolldown";
import { normalize } from "node:path";
import { readFile } from "node:fs/promises";

export default {
	name: "assets",
	async resolveId(id) {
		if (!id.startsWith("/assets")) return;

		const originalFileName = id.substring(1);
		const source = await readFile(originalFileName);
		const name = normalize(originalFileName);

		const refId = this.emitFile({
			type: "asset",
			name,
			source,
			originalFileName,
		});

		return this.getFileName(refId);
	},
	load(id) {
		if (id.includes("assets/")) return "";
	},
} as Plugin;
