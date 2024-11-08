// TODO: replace with lightningcss once it tailwind and autoprefixer plugins
import type { Plugin } from "rolldown";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const processor = postcss([
	tailwindcss,
	autoprefixer(),
]);

export default {
	name: "postcss",
	async transform(code, id) {
		if (id.endsWith(".css")) {
			const result = await processor.process(code, { from: id });
			return result.css;
		}

		return code;
	},
} as Plugin;
