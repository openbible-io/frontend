import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Plugin } from "vite";
import publications from "./src/publications.ts";
import langs from "./i18n/index.ts";

const pages = await Promise.all(Object.entries(langs).concat([["index", langs.eng]]).map(async (
	[id, imp],
) => {
	const dict = await imp();
	return {
		filename: `${id}.html`,
		template: "./src/app.html",
		script: "./src/app.ts",
		inject: {
			lang: id,
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
}));

const cacheDir = "";

export default {
	name: "vite:html",
	config() {
		return {
			build: {
				rollupOptions: {
					input: pages.reduce((acc, cur) => {
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
						acc[cur.filename] = path;
						return acc;
					}, {} as { [k: string]: string }),
				},
			},
		};
	},
} as Plugin;
