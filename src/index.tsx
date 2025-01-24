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

let warned = false;

interface Props {
	lang: string;
	translation: Translation;
	favicon?: string;
	scripts: string[];
	stylesheets: string[];
	webmanifest?: string;
	manifest: { [fname: string]: string };
}

// TODO: after https://issues.chromium.org/issues/40579931 remove [hash] and add integrity=
const Html = (props: Props) => (
	<html lang={props.lang}>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>OpenBible</title>
			{props.scripts
				.filter((s) => s != servicePath)
				.map((src) => <script src={src} type="module" />)}
			{props.stylesheets.map((s) => <link rel="stylesheet" href={s} />)}
			<link rel="icon" href={props.favicon} />
			<link rel="webmanifest" href={props.webmanifest} />
			{
				/*
				* Prefetch for faster first load AND to store what to cache to
				* service worker WITHOUT having to reload and intercept requests.
			 */
			}
			{Object.entries(props.manifest)
				.filter(([pathname]) =>
					!props.scripts.includes(pathname) &&
					!props.stylesheets.includes(pathname) &&
					!pathname.includes("favicon") && pathname != props.webmanifest
				)
				.map(([pathname]) => {
					if (pathname.endsWith(".woff2")) {
						return (
							<link
								rel="preload"
								as="font"
								type="font/woff2"
								crossorigin="anonymous"
								href={pathname}
							/>
						);
					}
					if (pathname.endsWith(".js")) {
						return (
							<link
								rel={(pathname.includes("i18n") &&
										!pathname.includes(props.lang))
									? "prefetch"
									: "modulepreload"}
								as={pathname == servicePath ? "serviceworker" : "script"}
								href={pathname}
							/>
						);
					}

					if (!warned) console.warn(pathname, "will NOT be cached for offline use");
				})}
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
		warned = true;
	}

	return res;
}
