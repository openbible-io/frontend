import { type RolldownOptions } from "rolldown";
import { replacePlugin as replace } from "rolldown/experimental";
import html from "./plugin-html.ts";
import size from "./plugin-size.ts";
import postcss from "./plugin-postcss.ts";
import image from "./plugin-image.ts";
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
			"import.meta.env.OPENBIBLE_VERSION": JSON.stringify(getVersion()),
			"import.meta.env.OPENBIBLE_VERSION_DATE": JSON.stringify(
				getVersionDate(),
			),
			"import.meta.env.DEV": dev.toString(),
		}),
		html,
		postcss,
		image,
		...(dev ? [servePlugin] : [size]),
	],
	resolve: {
		alias: {
			"react": "preact/compat",
			"react-dom": "preact/compat",
		},
	},
	output: {
		dir,
		entryFileNames: "[name].js",
		cssEntryFileNames: "[name].css",
		cssChunkFileNames: "chunks/[name].css",
		assetFileNames: "assets/[name][extname]",
		chunkFileNames(ci) {
			if (ci.facadeModuleId?.match(/i18n\/.*\.json/)) return "i18n/[name].js";
			return "chunks/[name].js";
		},
		hashCharacters: "base36",
		sourcemap: true,
		minify: true,
		// This allows users to only download our changed dependencies.
		advancedChunks: {
			groups: [
				{
					name: "rolldown",
					test: "rolldown:runtime",
					priority: 100,
				},
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
