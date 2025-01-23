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
import type { JSX } from "preact";
import { servicePath } from "../shared/workers.ts";

interface Props {
	lang: string;
	translation: Translation;
	favicon?: string;
	scripts: string[];
	stylesheets: string[];
	webmanifest?: string;
	manifest: { [fname: string]: string };
}

// TODO: remove ?integrity= after https://issues.chromium.org/issues/40579931
const Html = (props: Props) => (
	<html lang={props.lang}>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>OpenBible</title>
			{props.scripts
				.filter((s) => s != servicePath)
				.map((src) => (
					<script
						src={`${src}?integrity=${props.manifest[src]}`}
						type="module"
						integrity={props.manifest[src]}
					/>
				))}
			{Object.entries(props.manifest)
				.filter(([pathname]) =>
					(!props.scripts.includes(pathname) || pathname == servicePath) &&
					!pathname.includes("favicon-")
				)
				.map(([pathname, hash]) => {
					const res: JSX.LinkHTMLAttributes<HTMLLinkElement> = {
						href: `${pathname}?integrity=${hash}`,
					};
					if (pathname == props.webmanifest) res.rel = "manifest";
					else if (pathname == props.favicon) res.rel = "icon";
					else if (props.stylesheets.includes(pathname)) {
						res.rel = "stylesheet";
					} else if (props.scripts.includes(pathname)) {
						res.rel = "serviceworker";
					} else {
						res.rel = "preload";
						if (pathname.endsWith(".woff2")) {
							res.as = "font";
							res.crossorigin = "anonymous";
						} else if (
							pathname.endsWith(".webp") || pathname.endsWith(".png")
						) {
							res.as = "image";
						} else if (pathname.endsWith(".json")) {
							res.as = "fetch";
							res.crossorigin = "anonymous";
						} else if (pathname.endsWith(".js")) {
							res.as = "script";
							res.rel = "modulepreload";
						} else {
							console.error(
								"add `as`=https://fetch.spec.whatwg.org/#concept-request-destination:",
								pathname,
							);
						}
					}

					res.integrity = hash;
					return res;
				})
				.sort((p1, p2) => {
					const preload1 = (p1.rel?.toString() ?? "").includes("preload");
					const preload2 = (p2.rel?.toString() ?? "").includes("preload");
					if (preload1 != preload2) return preload1 > preload2 ? 1 : -1;

					return p1.href!.toString().localeCompare(p2.href!.toString());
				})
				.map((props) =>
					props.type
						? (
							<script
								{...(props as JSX.ScriptHTMLAttributes<HTMLScriptElement>)}
							/>
						)
						: <link {...(props as JSX.LinkHTMLAttributes<HTMLLinkElement>)} />
				)}
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
	}

	return res;
}
