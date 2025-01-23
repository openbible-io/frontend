import type { Plugin, PluginContext } from "rolldown";
import { compile } from "@tailwindcss/node";
import { bundleAsync, transform, Url } from "lightningcss";
import type { TransformOptions } from "lightningcss/node";
import { Buffer } from "node:buffer";
import { Scanner } from "@tailwindcss/oxide";
import { dirname, join } from "node:path";

async function lightningBundle(
	input: string,
	filename: string,
	minify: boolean,
	ctx: PluginContext,
): Promise<string> {
	const sourceMap = false; // TODO: enable after https://github.com/rolldown/rolldown/issues/3242;
	const commonOpts: TransformOptions = {
		filename,
		minify,
		sourceMap,
		drafts: {
			customMedia: true,
		},
		nonStandard: {
			deepSelectorCombinator: true,
		},
		errorRecovery: true,
	};

	// `visitor` is a sync API, but `ctx.load` is async. so first we gather URLs...
	// TODO: remove after https://github.com/rolldown/rolldown/issues/2921
	const urlMap: { [url: string]: string | undefined } = {};
	const promises: Promise<void>[] = [];
	const bundled = transform({
		code: Buffer.from(input),
		visitor: {
			Url(url: Url) {
				if (!url.url.startsWith("data:")) {
					promises.push((async () => {
						const m = await ctx.resolve(url.url, filename);
						urlMap[url.url] = m?.id;
					})());
				}
			},
		},
		...commonOpts,
	});
	await Promise.all(promises);

	// ...and then map them
	return transform({
		code: bundled.code,
		visitor: {
			Url(url: Url) {
				const mapped = urlMap[url.url];
				if (mapped) {
					url.url = mapped;
					return url;
				}
			},
		},
		...commonOpts,
	}).code.toString();
}

export default ({ minify = false }: { minify: boolean }) => ({
	name: "tailwindcss-transform",

	// Assumption: "src" contains all class candidates.
	// This prevents gathering all candidates from rolldown BEFORE transforming
	// root CSS files since Rolldown does not yet support sequential plugins.
	async transform(src, id, { moduleType }) {
		if (moduleType != "css") return;

		// Yeah, this is slow. Not sure how to deduplicate Rolldown work since it
		// doesn't give us an AST to crawl for strings.
		// TODO: use transform and renderStart once rolldown provides AST
		// ...can happen after oxc adds estree support: https://github.com/oxc-project/oxc/milestone/10
		const sources = [{
			base: join(import.meta.dirname!, "../src"),
			pattern: "**",
		}];
		const scanner = new Scanner({ sources });
		const candidates = scanner.scan();

		const compiler = await compile(src, {
			base: dirname(id),
			onDependency: (path: string) => {
				this.addWatchFile(path);
			},
		});

		let code = compiler.build(candidates);
		code = await lightningBundle(code, id, minify, this);
		return { code };
	},
} as Plugin);
