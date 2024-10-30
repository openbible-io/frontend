import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import preact from "@preact/preset-vite";
import { execSync } from "node:child_process";
import { env } from "node:process";

import publications from "./src/publications.ts";

const envPrefix = "OPENBIBLE_";
function setEnv(key: string, value: string) {
	env[`${envPrefix}${key}`] = value;
}
function getCommit() {
	const sha = execSync(`git rev-parse HEAD`);
	return sha.toString().trim();
}
function getCommitDate() {
	const date = execSync(
		`git show --no-patch --format=%cd --date=format:'%Y-%m-%d'`,
	);
	return date.toString().trim();
}
setEnv("COMMIT", getCommit());
setEnv("COMMIT_DATE", getCommitDate());
setEnv(
	"VERSIONS_HTML",
	Object.values(publications)
		.map(({ title, url }) => `<li><a href="${url}">${title}</a></li>`)
		.join(""),
);
setEnv('CACHE_FOREVER_REGEX', '-\\w{8}\\.[^.]*$');

export default defineConfig({
	plugins: [deno(), preact()],
	build: {
		target: "esnext",
		rollupOptions: {
			output: {
				 /** Must match CACHE_FOREVER_REGEX { */
				hashCharacters: 'base36',
				assetFileNames: "assets/[name]-[hash:8][extname]",
				/** } */
				// These rarely change.
				manualChunks(id: string) {
					if (id.match(/node_modules\/@?lexical/)) return "lexical";
					if (id.includes("node_modules/tinybase")) return "tinybase";
					if (id.match(/node_modules\/@?preact/)) return "preact";
					if (id.includes("node_modules/preact-iso")) return "preact-iso";
					if (id.includes("node_modules")) {
						console.warn('TODO: map to chunk', id);
						return "vendor";
					}
				},
			},
		},
	},
	envPrefix,
	// This following is so that we can put service workers under `src` but have the browser allow
	// them to register under { scope: `/` }
	server: {
		headers: {
			"Service-Worker-Allowed": "/",
		},
	},
	worker: {
		format: "es",
		rollupOptions: {
			output: {
				entryFileNames: "[name].worker.js",
			},
		},
	},
});
