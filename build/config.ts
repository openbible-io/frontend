import { type RolldownOptions } from "rolldown";
import { replacePlugin as replace } from "rolldown/experimental";
import manifest from "./plugin-manifest.ts";
import html from "../src/index.tsx";
import size from "./plugin-size.ts";
import postcss from "./plugin-postcss.ts";
import image from "./plugin-image.ts";
import json from "./plugin-json.ts";
import { getVersion, getVersionDate } from "./version.ts";
import denoJson from "../deno.json" with { type: "json" };

export const dir = "dist";
export const dev = Deno.args.includes("--dev");

export default {
	input: [
		"./src/app.tsx",
		"./src/workers/service.ts",
	],
	jsx: {
		mode: "automatic",
		jsxImportSource: denoJson.compilerOptions.jsxImportSource,
		development: dev,
	},
	plugins: [
		replace({
			"import.meta.env.OPENBIBLE_VERSION": JSON.stringify(getVersion()),
			"import.meta.env.OPENBIBLE_VERSION_DATE": JSON.stringify(
				getVersionDate(),
			),
			"import.meta.env.DEV": dev ? "true" : "false",
			"process.env.NODE_ENV": JSON.stringify(dev ? "dev" : "production"),
		}),
		postcss,
		image,
		json,
		manifest({
			favicon: import.meta.resolve("../assets/favicon.svg").replace("file://", ""),
			webmanifest: {
				name: "OpenBible",
				display: "standalone",
				// TODO: tailwind as source of truth
				background_color: "#f2f2f2",
				theme_color: "#0b8dc4",
			},
			html,
		}),
		...(dev ? [] : [size]),
	],
	output: {
		dir,
		entryFileNames: "[name].js",
		cssEntryFileNames: "[name].css",
		cssChunkFileNames: "chunks/[name].css",
		assetFileNames: "assets/[name][extname]",
		chunkFileNames: "chunks/[name].js",
		sourcemap: true,
		minify: true,
		comments: "none",
		// This allows users to only download our changed dependencies.
		advancedChunks: {
			groups: [
				{
					// TODO: remove after https://github.com/rolldown/rolldown/issues/2654
					name: "rolldown",
					test: "rolldown:runtime",
					priority: 100,
				},
				{
					name: "preact",
					test: /node_modules\/preact/,
					priority: 10,
				},
				{
					name: "tinybase",
					test: /node_modules\/tinybase/,
					priority: 9,
				},
				{
					name: "prosemirror",
					test: /node_modules\/(prosemirror|w3c-keyname|rope-sequence)/,
					priority: 8,
				},
				{
					name: "openbible",
					test: /node_modules\/@jsr\/openbible__/,
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
