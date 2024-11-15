import { render } from "preact-render-to-string";
import publications from "../shared/publications.ts";
import type { HtmlProps } from "../build/plugin-manifest.ts";
import langs, { Translation } from "../shared/i18n.ts";

interface Props {
	lang: string;
	translation: Translation;
	favicon?: string;
	scripts: {
		entries: string[];
		other: string[];
	};
	stylesheets: string[];
	webmanifest?: string;
	manifest: { [fname: string]: string };
}
const Html = (props: Props) => (
	<html lang={props.lang}>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>OpenBible</title>
			<link rel="icon" href={props.favicon} />
			<link rel="manifest" href={props.webmanifest} />
			{props.scripts.entries
				.filter((e) => !e.includes("service"))
				.map((e) => <script type="module" src={e} />)}
			{props.stylesheets.map((s) => <link rel="stylesheet" href={s} />)}
			{props.scripts.other
				.filter((s) =>
					s.includes("i18n")
						? s.includes(props.lang)
						: true
				)
				.concat(...props.scripts.entries.filter(e => e.includes("service")))
				.map((s) => <link rel="modulepreload" href={s} />)}
		</head>
		<body>
			<noscript>
				{props.translation.noscript}
				<ul>
					{Object.values(publications).map((p) => (
						<li>
							<a href={p.url}>{p.title}</a>
						</li>
					))}
				</ul>
			</noscript>
			<script
				dangerouslySetInnerHTML={{
					__html: `window.MANIFEST = ${JSON.stringify(props.manifest)}`,
				}}
			/>
			<div id="app" />
		</body>
	</html>
);

export default async function sources(props: HtmlProps) {
	const res: { [fname: string]: string } = {};

	for (const e2 of Object.entries(langs)) {
		const [lang, { translation }] = e2;
		const t = (await translation()).default;

		const source = "<!doctype html>" + render(
			<Html
				lang={lang}
				translation={t}
				{...props}
			/>,
		);
		res[`i18n/${lang}.html`] = source;
		if (lang == "eng") res["index.html"] = source;
	}

	return res;
}
