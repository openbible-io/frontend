// I really wish vite "just worked" with service workers designed for
// offline use, BUT:
// - The dev mode asset tree looks nothing like the prod asset tree, making
// offline caching strategies difficult to test.
// - There is no (easy) way to export the bundled file list from the main
// app to the service worker for precaching, _especially_ dynamically imported
// i18n JSON files.
// - Registering the service worker under `/` requires multiple config options
// and a magic `?worker&url` import suffix.
//
// For these reasons we write build scripts.
import { rolldown, type RolldownOptions, watch } from "rolldown";
import svelte from "rollup-plugin-svelte";
import size from "./size.ts";
import replace from "./plugin-replace.ts";
import html from "./plugin-html.ts";

const dir = "dist";
const dev = Deno.args.includes("--dev");

const options: RolldownOptions = {
	input: "src/app.ts",
	plugins: [
		svelte({ compilerOptions: { dev } }),
		replace({
			DEV: dev.toString(),
			BROWSER: 'true',
			[`import .* from ['"]esm-env['"]`]: "",
		}),
		html(),
	],
	output: {
		dir,
		// TODO: uncomment after https://github.com/rolldown/rolldown/issues/2618
		//cssFileNames: "[name]-[hash].css",
		entryFileNames: "[name]-[hash].js",
		assetFileNames: "assets/[name]-[hash].js",
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
	experimental: {
		strictExecutionOrder: true,
	},
};

const bundle = await rolldown(options);
await bundle.write(options.output);
await size(dir);

if (dev) {
	const watcher = await watch(options);
	console.log(watcher);
	//await watcher.close();
} else {
}
