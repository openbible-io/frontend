import { type Plugin } from "rolldown";
import { transform } from "rolldown/experimental";
import {
	type DenoMediaType,
	type DenoResolveResult,
	isDenoSpecifier,
	parseDenoSpecifier,
	resolveViteSpecifier,
} from "./resolver.ts";

export default function denoPlugin(): Plugin {
	let cwd = Deno.cwd();
	const cache = new Map<string, DenoResolveResult>();

	return {
		name: "deno",
		renderStart(_, config) {
			if (config.cwd) cwd = config.cwd;
		},
		async resolveId(id, importer) {
			return await resolveViteSpecifier(id, cache, cwd, importer);
		},
		async load(id) {
			if (!isDenoSpecifier(id)) return;

			const { loader, resolved } = parseDenoSpecifier(id);

			const content = await Deno.readTextFile(resolved);
			if (loader === "JavaScript") return content;
			if (loader === "Json") {
				return `export default ${content}`;
			}

			const result = transform(resolved, content, {
				sourceType: "module",
				sourcemap: true,
				lang: mediaTypeToLoader(loader),
			});

			return result;
		},
	};
}

function mediaTypeToLoader(media: DenoMediaType) {
	switch (media) {
		case "JSX":
			return "jsx";
		case "JavaScript":
			return "js";
		case "TSX":
			return "tsx";
		case "TypeScript":
			return "ts";
	}
}
