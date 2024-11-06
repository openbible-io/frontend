/** @module
 * Builds an HTML file per-language with injected strings, css, and scripts.
 */
import type { Plugin } from "rolldown";
import publications from "../shared/publications.ts";
import langs from "../shared/i18n.ts";

const htmlTemplate = `
<!doctype html>
<html lang="<%- lang %>">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="shortcut icon" href="/favicon.svg" />
		<link rel="manifest" href="/manifest.json" />
		<%- stylesheet %>
		<title><%- title %></title>
	</head>
	<body>
		<%- noscript %>
		<div id="app"></div>
		<%- script %>
	</body>
</html>
`;

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
			const bundled = output.map((o) => o.fileName);
			const script = bundled.filter((fname) => fname.endsWith(".js")).map((s) =>
				`<script type="module" src="/${s}"></script>`
			).join("");
			const stylesheet = bundled.filter((fname) => fname.endsWith(".css")).map((
				s,
			) => `<link rel="stylesheet" href="/${s}" />`).join("");
			for (const e of Object.entries(langs)) {
				const [lang, imp] = e;
				const dict = (await imp()).default;
				let html = htmlTemplate;
				Object.entries({
					lang,
					title: dict.title,
					noscript: `<noscript>${dict.noscript ?? ""}${ul}</noscript>`,
					stylesheet,
					script,
				}).forEach(([k, v]) => {
					html = html.replaceAll(`<%- ${k} %>`, v);
				});
				this.emitFile({
					type: "asset",
					source: html,
					fileName: `${lang}.html`,
				});
				if (lang == "eng") {
					this.emitFile({
						type: "asset",
						source: html,
						fileName: "index.html",
					});
				}
			}
		},
	};
}
