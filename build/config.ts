import { type RolldownOptions } from "rolldown";
import { replacePlugin as replace } from "rolldown/experimental";
import deno from "./plugin-deno.ts";
import html from "./plugin-html.ts";
import size from "./plugin-size.ts";
import copy from "./plugin-copy.ts";
import { plugin as servePlugin } from "./server.ts";
import { getVersion, getVersionDate } from "./version.ts";

export const dir = "dist";
export const dev = Deno.args.includes("--dev");

export default {
	input: [
		"./src/app.tsx",
		"./src/workers/service.ts",
	],
	plugins: [
		replace({
			OPENBIBLE_VERSION: JSON.stringify(getVersion()),
			OPENBIBLE_VERSION_DATE: JSON.stringify(getVersionDate()),
			"import.meta.env.DEV": dev.toString(),
		}),
		deno(),
		html(),
		copy(["public"]),
		...(dev ? [servePlugin] : [size]),
	],
	resolve: {
		alias: {
			"react": "preact/compat",
			"react-dom": "preact/compat",
		},
	},
	profilerNames: false, // false = minified rolldown runtime
	output: {
		dir,
		exports: "none", // app, not lib
		externalLiveBindings: false, // we all use esm
		entryFileNames: "[name]-[hash].js",
		cssEntryFileNames: "[name]-[hash].css",
		cssChunkFileNames: "chunks/[name]-[hash].css",
		assetFileNames: "assets/[name]-[hash].js",
		chunkFileNames: "chunks/[name]-[hash].js",
		sourcemap: true,
		minify: true,
		// This allows users to only download our changed dependencies.
		advancedChunks: {
			groups: [
				{
					name: "tinybase",
					test: /node_modules\/tinybase/,
					priority: 10,
				},
				{
					name: "preact",
					test: /node_modules\/preact/,
					priority: 9,
				},
				{
					name: "prosemirror",
					test: /node_modules\/(prosemirror|w3c-keyname|rope-sequence)/,
					priority: 8,
				},
				{
					name: "html5parser",
					test: /node_modules\/html5parser/,
					priority: 7,
				},
				{
					name: "components",
					test: /node_modules\/@skeletonlabs/,
					priority: 9,
				},
				{
					// If something's in this module we have an accounting error.
					name: "vendor",
					test: /node_modules/,
					priority: 4,
				},
			],
		},
	},
	// TODO: remove after https://github.com/rolldown/rolldown/issues/2654
	experimental: {
		strictExecutionOrder: false,
	},
} as RolldownOptions;
