// Simpler version of
// https://github.com/rollup/plugins/blob/master/packages/url/src/index.js
import type { Plugin } from "rolldown";
import { dirname, normalize, resolve } from "node:path";
import { readFile } from "node:fs/promises";

const re = /\.(woff2)$/;

export default {
	name: "assets",
	async resolveId(id, importee) {
		if (!id.match(re)) return;

		const originalFileName = resolve(dirname(importee!), id);
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
		if (id.match(re)) return "";
	},
} as Plugin;
