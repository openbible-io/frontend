import { type RolldownOptions } from "rolldown";
import svelte from "rollup-plugin-svelte";
import replace from "./plugin-replace.ts";
//import { replacePlugin as replace } from "rolldown/experimental";
import html from "./plugin-html.ts";
import size from "./plugin-size.ts";
import copy from "./plugin-copy.ts";
import { plugin as servePlugin } from "./server.ts";
import { getVersion, getVersionDate } from "./version.ts";

export const dir = "dist";
export const dev = Deno.args.includes("--dev");

export default {
	input: [
		"./src/app.ts",
		"./src/workers/service.ts",
	],
	plugins: [
		svelte(),
		replace({
			OPENBIBLE_VERSION: JSON.stringify(getVersion()),
			OPENBIBLE_VERSION_DATE: JSON.stringify(getVersionDate()),
			["import.+from.+esm-env.+"]: "",
			DEV: dev.toString(),
			BROWSER: "true",
		}),
		html(),
		copy(["public"]),
		...(dev ? [servePlugin] : [size]),
	],
	// false = minified rolldown runtime
	profilerNames: false,
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
					// TODO: remove after https://github.com/rolldown/rolldown/issues/2655
					name: "tslib",
					test: /node_modules\/tslib/,
					priority: 11,
				},
				{
					name: "tinybase",
					test: /node_modules\/tinybase/,
					priority: 10,
				},
				{
					name: "svelte",
					test: /node_modules\/(svelte|tinro|esm\-env)/,
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
					name: "vendor",
					test: /node_modules/,
					priority: 6,
				},
			],
		},
	},
	// TODO: remove after https://github.com/rolldown/rolldown/issues/2654
	experimental: {
		strictExecutionOrder: false,
	},
} as RolldownOptions;
