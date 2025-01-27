import {
	OutputOptions,
	PreRenderedChunk,
	type RolldownOptions,
} from "rolldown";
import { replacePlugin } from "rolldown/experimental";
import manifest from "./plugin-manifest.ts";
import html from "../src/index.tsx";
import size from "./plugin-size.ts";
import tailwind from "./plugin-tailwind.ts";
import assets from "./plugin-assets.ts";
import { getVersion, getVersionDate } from "./version.ts";
import { servicePath } from "../shared/workers.ts";

// TODO: make dynamic
const bgColor = "#f3f4f6";
const brandColor = "#007db5";
export const dir = "dist";
export const dev = Deno.args.includes("--dev");

// We don't minify in dev because not all plugins support source maps AND
// it takes slightly longer (few ms).
const minify = !dev;

type Options = RolldownOptions & { output: OutputOptions };

const app: Options = {
	input: [
		"./src/bootstrap.ts",
		"./src/app.tsx",
		"./src/workers/service.ts",
	],
	jsx: {
		mode: "automatic",
		jsxImportSource: "preact",
		development: dev,
	},
	plugins: [
		replacePlugin({
			"import.meta.env.OPENBIBLE_VERSION": JSON.stringify(getVersion()),
			"import.meta.env.OPENBIBLE_VERSION_DATE": JSON.stringify(
				getVersionDate(),
			),
			"import.meta.env.DEV": dev ? "true" : "false",
			"process.env.NODE_ENV": JSON.stringify(dev ? "dev" : "production"),
		}),
		assets,
		tailwind({ minify }),
		manifest({
			favicon: import.meta.resolve("../assets/favicon.svg").replace(
				"file://",
				"",
			),
			webmanifest: {
				name: "OpenBible",
				display: "standalone",
				start_url: "/",
				background_color: bgColor,
				theme_color: brandColor,
			},
			html,
		}),
		// TODO: add plugin to remove "ssr" from i18n JSON 
		...(dev ? [] : [size]),
	],
	output: {
		dir,
		hashCharacters: "base36",
		// TODO: after https://issues.chromium.org/issues/40579931 remove [hash]
		// and add integrity= to <link> and <script>s in HTML
		entryFileNames(id: PreRenderedChunk) {
			if (id.name == "service") return servicePath.substring(1);
			return "[name]-[hash].js"; 
		},
		cssEntryFileNames: "[name]-[hash].css",
		cssChunkFileNames: "chunks/[name]-[hash].css",
		assetFileNames: "assets/[name]-[hash][extname]",
		chunkFileNames(id: PreRenderedChunk) {
			if (id?.facadeModuleId?.match(/i18n\/[^/]+.json/)) {
				return "i18n/[name]-[hash].js";
			}
			return "chunks/[name]-[hash].js";
		},
		sourcemap: true,
		minify,
		comments: "none",
		// Goal: Put rarely changing deps into chunks so users do not have to
		// redownload them when we update.
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
};

// TODO: uncomment to support firefox if this stays unfixed:
// https://bugzilla.mozilla.org/show_bug.cgi?id=1360870
// https://caniuse.com/mdn-javascript_statements_import_service_worker_support
//const serviceWorker: Options = {
//	input: "./src/workers/service.ts",
//	plugins: [
//		...(dev ? [] : [size]),
//	],
//	output: {
//		dir,
//		entryFileNames: "[name].js",
//		sourcemap: true,
//		minify,
//		comments: "none",
//		format: 'iife',
//	}
//};

export default [app];
