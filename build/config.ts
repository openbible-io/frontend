import { type RolldownOptions } from "rolldown";
import { replacePlugin as replace } from "rolldown/experimental";
import manifest from "./plugin-manifest.ts";
import html from "../src/index.tsx";
import size from "./plugin-size.ts";
import postcss from "./plugin-postcss.ts";
import image from "./plugin-image.ts";
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
		postcss,
		image,
		manifest({
			favicon: "./src/favicon.svg",
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
		comments: "none",
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
