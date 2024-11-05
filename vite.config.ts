import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { execSync } from "node:child_process";
import { env } from "node:process";
import htmlPlugin from "./html.plugin.ts";

const envPrefix = "OPENBIBLE_";
function setEnv(key: string, value: string) {
	env[`${envPrefix}${key}`] = value;
}
function getCommit() {
	return execSync(`git rev-parse HEAD`).toString().trim();
}
function getCommitDate() {
	const date = execSync(
		`git show --no-patch --format=%cd --date=format:'%Y-%m-%d'`,
	);
	return date.toString().trim();
}
setEnv("COMMIT", getCommit());
setEnv("COMMIT_DATE", getCommitDate());
setEnv('CACHE_FOREVER_REGEX', '-\\w{8}\\.[^.]*$');

export default defineConfig({
	plugins: [deno(), svelte(), htmlPlugin],
	build: {
		manifest: true,
		rollupOptions: {
			output: {
/** Must match CACHE_FOREVER_REGEX { */
				hashCharacters: "base36",
				assetFileNames: "assets/[name]-[hash:8][extname]",
/** } */
				manualChunks(id) {
					if (id.match(/node_modules\/@?lexical/)) return "lexical";
					if (id.includes("node_modules/tinybase")) return "tinybase";
					if (id.match(/node_modules\/[svelte|tinro]/)) return "svelte";
					//if (id.match(/node_modules\/[prosemirror|w3c-keyname|rope-sequence]/)) return 'prosemirror';
					if (
						id.includes("node_modules") && !id.includes("node_modules/esm-env")
					) {
						console.warn("TODO: map to chunk", id);
						return "vendor";
					}
				},
			},
		},
	},
	// This following is so that we can put service workers under `src`
	// instead of /. The browser only allows { scope: `/` } up to the file
	// position of the worker...
	server: { headers: { "Service-Worker-Allowed": "/" } },
	worker: { rollupOptions: { output: { entryFileNames: "[name].worker.js" } } },
	envPrefix,
});
