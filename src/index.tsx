// This is run in deno.
import { render } from "preact-render-to-string";
import publications from "../shared/publications.ts";
import type { HtmlProps } from "../build/plugin-manifest.ts";
import translations, {
	base,
	impDeno,
	Locale,
	Translation,
} from "../shared/i18n.ts";
import { servicePath } from "../shared/workers.ts";
import { SSR } from "./bootstrap.ts";

interface Props {
	lang: string;
	translation: Translation;
	entrypoints: string[];
	favicon?: string;
	webmanifest?: string;
	rest: string[];
}

const Html = (props: Props) => (
	<html lang={props.lang}>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>OpenBible</title>
			{/* Load bootstrap and its deps. */}
			<script
				type="module"
				src={props.entrypoints.find((e) => e.includes("bootstrap"))}
			/>
			<link rel="modulepreload" as="script" href={servicePath} />
			<link
				rel="modulepreload"
				as="script"
				href={props.rest.find((e) => e.includes("rolldown"))}
			/>
			{/* Prevent browser foolishly fetching "favicon.ico" */}
			<link rel="icon" href={props.favicon} />
		</head>
		<body>
			<noscript>
				{props.translation.ssr.noscript}
				<ul>
					{Object.values(publications).map((p) => (
						<li>
							<a href={p.url}>{p.title}</a>
						</li>
					))}
				</ul>
			</noscript>
			<div id="app" />
			<script
				dangerouslySetInnerHTML={{
					__html: `window.SSR=${
						JSON.stringify({
							noworker: props.translation.ssr.noworker,
							entrypoints: props.entrypoints,
							webmanifest: props.webmanifest,
							rest: props.rest,
							lang: props.lang,
						} as SSR)
					}`,
				}}
			/>
		</body>
	</html>
);

export default async function sources(props: HtmlProps) {
	const res: { [fname: string]: string } = {};

	for (const lang of (Object.keys(translations) as Locale[])) {
		const t = await impDeno(lang);

		const source = "<!doctype html>" + render(
			<Html
				lang={lang}
				translation={t.default}
				{...props}
			/>,
		);
		res[`i18n/${lang}.html`] = source;
		if (lang == base) res["index.html"] = source;
	}

	return res;
}
