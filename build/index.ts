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
		replace(dev),
		html(),
		{
			watchChange(id, event) {
				if (event.event === "update") {
					console.log('update!!');
				}
			},
		},
	],
	output: {
		dir,
		// TODO: uncomment after https://github.com/rolldown/rolldown/issues/2618
		//cssFileNames: "[name]-[hash].js",
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
};

const bundle = await rolldown(options);
await bundle.write(options.output);

if (dev) {
	const watcher = await watch(options);
	//await watcher.close();
	//console.log(watcher);
} else {
	await size(dir);
}
