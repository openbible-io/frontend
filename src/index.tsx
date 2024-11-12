// This HTML template is used in `../build/plugin-html.ts`
import { Language } from "../shared/i18n.ts";
import publicationzzzz from "../shared/publications.ts";

// In a perfect world we would be able to make this the entrypoint and write
// something like:
// import { entry, scripts, stylesheets } from './app.tsx?entry';
// import favicon from './favicon.svg?favicon';
// export { [fname: string]: html string };

export interface Props {
	lang: Language;
	noscript?: string;
	entry: string;
	favicon: string;
	scripts: string[];
	stylesheets: string[];
	manifest: { [fname: string]: string };
	webmanifest: string;
}
export default (props: Props) => (
	<html lang={props.lang}>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>OpenBible</title>
			<link rel="icon" href={props.favicon} />
			<link rel="manifest" href={props.webmanifest} />
			<script type="module" src={props.entry} />
			{props.stylesheets.map((s: string) => <link rel="stylesheet" href={s} />)}
			{props.scripts
				.filter((s: string) => {
					if (!s.includes("i18n")) return true;
					if (s.includes(props.lang)) return true;
					return false;
				})
				.map((s: string) => <link rel="modulepreload" href={s} />)}
		</head>
		<body>
			<noscript>
				{props.noscript}
				<ul>
					{Object.values(publicationzzzz).map((p) => (
						<li>
							<a href={p.url}>{p.title}</a>
						</li>
					))}
				</ul>
			</noscript>
			<script dangerouslySetInnerHTML={{ __html: `window.MANIFEST = ${JSON.stringify(props.manifest)}` }} />
			<div id="app" />
		</body>
	</html>
);
