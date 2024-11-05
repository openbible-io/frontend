import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Plugin } from "vite";
import publications from "./src/publications.ts";
import { type Dictionary, langs } from "./src/i18n.ts";

function makeTemplate(lang: Language, basename: string) {
	const json = readFileSync(join("public", "i18n", lang + '.json'), "utf8");
	const dict = JSON.parse(json) as Dictionary;
	return {
		filename: `${basename}.html`,
		template: "./src/app.html",
		script: "./src/app.ts",
		inject: {
			lang,
			title: dict.title ?? "",
			noscript: `<noscript>
${dict.noscript ?? ""}
<ul>
${
				Object.values(publications)
					.map(({ title, url }) => `<li><a href="${url}">${title}</a></li>`)
					.join("")
			}
</ul>
</noscript>`,
		},
	};
}

const cacheDir = "";

export default {
	name: "vite:html",
	config() {
		return {
			build: {
				rollupOptions: {
					input: langs
						.map((l) => makeTemplate(l, l))
						.concat(makeTemplate("eng", "index"))
						.map((cur) => {
							let template = readFileSync(cur.template, "utf8");
							const path = join(cacheDir, cur.filename);
							const dir = dirname(path);
							mkdirSync(dir, { recursive: true });
							Object.entries(cur.inject).concat([[
								"script",
								relative(dir, cur.script),
							]]).forEach(([k, v]) => {
								template = template.replaceAll(`<%- ${k} %>`, v);
							});
							writeFileSync(path, template);
							return path;
						}),
				},
			},
		};
	},
} as Plugin;
