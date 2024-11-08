/** @module
 * Builds an HTML file per-language with injected strings, css, and scripts.
 */
import type { Plugin, RolldownOutputChunk } from "rolldown";
import publications from "../shared/publications.ts";
import langs from "../shared/i18n.ts";

const htmlUrl = import.meta.resolve("./template.html");
const htmlTemplate = Deno.readTextFileSync(new URL(htmlUrl).pathname);

export default function pluginHtml(): Plugin {
	return {
		name: "html",
		async generateBundle(_, b) {
			const output = Object.values(b);

			const ul = `<ul>${
				Object.values(publications)
					.map(({ title, url }) => `<li><a href="${url}">${title}</a></li>`)
					.join("")
			}</ul>`;

			const scripts = output
				.filter(({ fileName }) => fileName.endsWith(".js"))
				.map((s) =>
					(s as RolldownOutputChunk)?.isEntry
						? `<script type="module" src="/${s.fileName}"></script>`
						: `<link rel="modulepreload" href="/${s.fileName}">`
				)
				.join("\n\t\t");

			const bundled = output.map((o) => o.fileName);
			const stylesheets = bundled
				.filter((fname) => fname.endsWith(".css"))
				.map((s) => `<link rel="stylesheet" href="/${s}" />`)
				.join("\n\t\t");

			const manifest = bundled.filter((fname) => !fname.match(/\.(map|html)$/));

			for (const e of Object.entries(langs)) {
				const [lang, imp] = e;
				const dict = (await imp()).default;
				let source = htmlTemplate;
				Object.entries({
					lang,
					title: dict.title,
					noscript: `<noscript>${dict.noscript ?? ""}${ul}</noscript>`,
					stylesheets,
					scripts,
					manifest: JSON.stringify(manifest),
				}).forEach(([k, v]) => {
					source = source.replaceAll(`<%- ${k} %>`, v);
				});

				this.emitFile({ type: "asset", source, fileName: `${lang}.html` });
				if (lang == "eng") {
					this.emitFile({ type: "asset", source, fileName: "index.html" });
				}
			}
		},
	};
}
