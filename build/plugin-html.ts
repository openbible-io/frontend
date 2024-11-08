/** @module
 * Builds an HTML file per-language with injected strings, css, and scripts.
 */
import type { Plugin } from "rollup";
import publications from "../shared/publications.ts";
import langs from "../shared/i18n.ts";

const htmlTemplate = `<!doctype html>
<html lang="<%- lang %>">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" href="/favicon.svg" />
		<link rel="manifest" href="/manifest.json" />
		<%- stylesheets %>
		<title><%- title %></title>
		<%- scripts %>
	</head>
	<body>
		<%- noscript %>
		<div id="app"></div>
		<script>
			window.MANIFEST = <%- manifest %>
		</script>
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

			const scripts = output
				.filter(({ fileName }) => fileName.endsWith(".js"))
				.map(({ isEntry, fileName }) =>
					isEntry
						? `<script type="module" src="/${fileName}"></script>`
						: `<link rel="modulepreload" href="/${fileName}">`
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
