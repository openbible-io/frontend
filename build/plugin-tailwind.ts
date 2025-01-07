import type { Plugin } from "rolldown";
import { compile } from "@tailwindcss/node";
import { transform } from "lightningcss";
import { Buffer } from "node:buffer";
import { Scanner } from "@tailwindcss/oxide";
import { dirname, join } from "node:path";

function optimizeCss(input: string, filename: string, minify: boolean) {
	function optimize(code: Buffer | Uint8Array) {
		return transform({
			filename,
			code,
			minify,
			sourceMap: false,
			drafts: {
				customMedia: true,
			},
			nonStandard: {
				deepSelectorCombinator: true,
			},
			errorRecovery: true,
		}).code;
	}

	return optimize(optimize(Buffer.from(input))).toString();
}

export default ({ minify = false }: { minify: boolean }) => ({
	name: "tailwindcss-transform",

	// Assumption: "src" contains all class candidates.
	// This prevents gathering all candidates from rolldown BEFORE transforming
	// root CSS files since Rolldown does not yet support sequential plugins.
	async transform(src, id, { moduleType }) {
		if (moduleType != "css") return;

		// Yeah, this is slow. Not sure how to deduplicate Rolldown work.
		const sources = [{ base: join(import.meta.dirname!, "../src"), pattern: "**" }];
		const scanner = new Scanner({ sources });
		const candidates = scanner.scan();

		const compiler = await compile(src, {
			base: dirname(id),
			shouldRewriteUrls: false,
			onDependency: (path: string) => {
				this.addWatchFile(path);
			},
		});

		let code = compiler.build(candidates);
		code = optimizeCss(code, id, minify);
		return { code };
	},
} as Plugin);
