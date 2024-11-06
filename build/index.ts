// I really wish vite "just worked" with service workers designed for
// offline use, BUT:
// - The dev mode asset tree looks nothing like the prod asset tree, making
// offline caching strategies difficult to test in dev.
// - Registering the service worker under `/` requires multiple config options
// and a magic `?worker&url` import suffix.
//
// For these reasons we write build scripts.
import {
	rolldown,
	type RolldownOptions,
	type RolldownOutput,
	watch,
} from "rolldown";
import svelte from "rollup-plugin-svelte";
import replace from "./plugin-replace.ts";
import html from "./plugin-html.ts";
import size from "./plugin-size.ts";
import { getVersion, getVersionDate } from "./version.ts";

const dir = "dist";
const dev = Deno.args.includes("--dev");

const options: RolldownOptions = {
	input: [
		"./src/app.ts",
		"./src/workers/service.ts",
	],
	plugins: [
		svelte({ compilerOptions: { dev } }),
		replace({
			OPENBIBLE_VERSION: JSON.stringify(getVersion()),
			OPENBIBLE_VERSION_DATE: JSON.stringify(getVersionDate()),
			...(dev ? {} : {
				DEV: dev.toString(),
				BROWSER: "true",
				[`import .* from ['"]esm-env['"]`]: "",
			}),
		}),
		html(),
		size,
	],
	output: {
		dir,
		// TODO: uncomment after https://github.com/rolldown/rolldown/issues/2618
		//cssFileNames: "[name].css",
		entryFileNames: `[name].js`,
		assetFileNames: `assets/[name].js`,
		chunkFileNames: `chunks/[name].js`,
		sourcemap: true,
		minify: !dev,
		advancedChunks: {
			groups: [
				{ name: "tinybase", test: /node_modules\/tinybase/ },
				{ name: "svelte", test: /node_modules\/[svelte|tinro|esm\-env]/ },
				{
					name: "prosemirror",
					test: /node_modules\/[prosemirror|w3c-keyname|rope-sequence]/,
				},
				{ name: "vendor", test: /node_modules/ },
			],
		},
	},
};

if (dev) {
	await watch(options);
} else {
	const build = await rolldown(options);
	await build.write(options.output);
}
