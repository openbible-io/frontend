// Fork of: https://github.com/tailwindlabs/tailwindcss/blob/bd43d63df27b89947c13d49f0e4ecdd94e925f33/packages/%40tailwindcss-vite/src/index.ts#L239
// svelte, vite, and SSR parts removed
import type { Plugin } from "rolldown";
import { compile, env, normalizePath } from "@tailwindcss/node";
import { clearRequireCache } from "@tailwindcss/node/require-cache";
import { Scanner } from "@tailwindcss/oxide";
import { Features, transform } from "lightningcss";
import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";

/**
 * A Map that can generate default values for keys that don't exist.
 * Generated default values are added to the map to avoid recomputation.
 */
class DefaultMap<K, V> extends Map<K, V> {
	constructor(private factory: (key: K, self: DefaultMap<K, V>) => V) {
		super();
	}

	override get(key: K): V {
		let value = super.get(key);

		if (value === undefined) {
			value = this.factory(key, this);
			this.set(key, value);
		}

		return value;
	}
}

class Root {
	// Content is only used in serve mode where we need to capture the initial
	// contents of the root file so that we can restore it during the
	// `renderStart` hook.
	public lastContent: string = "";

	// When set, indicates that the root was built before the Vite transform hook
	// was being called. This can happen in scenarios like when preprocessing
	// `<style>` tags for Svelte components.
	//
	// It can be set to a list of dependencies that will be added whenever the
	// next `transform` hook is being called.
	public builtBeforeTransform: string[] | undefined;

	// The lazily-initialized Tailwind compiler components. These are persisted
	// throughout rebuilds but will be re-initialized if the rebuild strategy is
	// set to `full`.
	private compiler?: Awaited<ReturnType<typeof compile>>;

	public requiresRebuild: boolean = true;

	// This is the compiler-specific scanner instance that is used only to scan
	// files for custom @source paths. All other modules we scan for candidates
	// will use the shared moduleGraphScanner instance.
	private scanner?: Scanner;

	// List of all candidates that were being returned by the root scanner during
	// the lifetime of the root.
	private candidates: Set<string> = new Set<string>();

	// List of all dependencies captured while generating the root. These are
	// retained so we can clear the require cache when we rebuild the root.
	private dependencies = new Set<string>();

	// The resolved path given to `source(…)`. When not given this is `null`.
	private basePath: string | null = null;

	public overwriteCandidates: string[] | null = null;

	constructor(
		private id: string,
		private getSharedCandidates: () => Map<string, Set<string>>,
		private base: string,
	) {}

	// Generate the CSS for the root file. This can return false if the file is
	// not considered a Tailwind root. When this happened, the root can be GCed.
	public async generate(
		content: string,
		addWatchFile: (file: string) => void,
	): Promise<string | false> {
		this.lastContent = content;

		const inputPath = idToPath(this.id);
		const inputBase = path.dirname(path.resolve(inputPath));

		if (!this.compiler || !this.scanner || this.requiresRebuild) {
			clearRequireCache(Array.from(this.dependencies));
			this.dependencies = new Set([idToPath(inputPath)]);

			env.DEBUG && console.time("[@tailwindcss/vite] Setup compiler");
			this.compiler = await compile(content, {
				base: inputBase,
				shouldRewriteUrls: true,
				onDependency: (path: string) => {
					addWatchFile(path);
					this.dependencies.add(path);
				},
			});
			env.DEBUG && console.timeEnd("[@tailwindcss/vite] Setup compiler");

			const sources = (() => {
				// Disable auto source detection
				if (this.compiler.root === "none") {
					return [];
				}

				// No root specified, use the module graph
				if (this.compiler.root === null) {
					return [];
				}

				// Use the specified root
				return [this.compiler.root];
			})().concat(this.compiler.globs);

			this.scanner = new Scanner({ sources });
		}

		if (!this.overwriteCandidates) {
			// This should not be here, but right now the Vite plugin is setup where we
			// setup a new scanner and compiler every time we request the CSS file
			// (regardless whether it actually changed or not).
			env.DEBUG && console.time("[@tailwindcss/vite] Scan for candidates");
			for (const candidate of this.scanner.scan()) {
				this.candidates.add(candidate);
			}
			env.DEBUG && console.timeEnd("[@tailwindcss/vite] Scan for candidates");
		}

		// Watch individual files found via custom `@source` paths
		for (const file of this.scanner.files) {
			addWatchFile(file);
		}

		// Watch globs found via custom `@source` paths
		for (const glob of this.scanner.globs) {
			if (glob.pattern[0] === "!") continue;

			let relative = path.relative(this.base, glob.base);
			if (relative[0] !== ".") {
				relative = "./" + relative;
			}
			// Ensure relative is a posix style path since we will merge it with the
			// glob.
			relative = normalizePath(relative);

			addWatchFile(path.posix.join(relative, glob.pattern));

			const root = this.compiler.root;

			if (root !== "none" && root !== null) {
				const basePath = normalizePath(path.resolve(root.base, root.pattern));

				const isDir = await fs.stat(basePath).then(
					(stats) => stats.isDirectory(),
					() => false,
				);

				if (!isDir) {
					throw new Error(
						`The path given to \`source(…)\` must be a directory but got \`source(${basePath})\` instead.`,
					);
				}

				this.basePath = basePath;
			} else if (root === null) {
				this.basePath = null;
			}
		}

		this.requiresRebuild = true;

		env.DEBUG && console.time("[@tailwindcss/vite] Build CSS");
		const result = this.compiler.build(
			[...this.sharedCandidates(), ...this.candidates],
		);
		env.DEBUG && console.timeEnd("[@tailwindcss/vite] Build CSS");

		return result;
	}

	private sharedCandidates(): Set<string> {
		if (!this.compiler) return new Set();
		if (this.compiler.root === "none") return new Set();

		const HAS_DRIVE_LETTER = /^[A-Z]:/;

		const shouldIncludeCandidatesFrom = (id: string) => {
			if (this.basePath === null) return true;

			if (id.startsWith(this.basePath)) return true;

			// This is a windows absolute path that doesn't match so return false
			if (HAS_DRIVE_LETTER.test(id)) return false;

			// We've got a path that's not absolute and not on Windows
			// TODO: this is probably a virtual module -- not sure if we need to scan it
			if (!id.startsWith("/")) return true;

			// This is an absolute path on POSIX and it does not match
			return false;
		};

		const shared = new Set<string>();

		for (const [id, candidates] of this.getSharedCandidates()) {
			if (!shouldIncludeCandidatesFrom(id)) continue;

			for (const candidate of candidates) {
				shared.add(candidate);
			}
		}

		return shared;
	}
}

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
			include: Features.Nesting,
			exclude: Features.LogicalProperties,
			errorRecovery: true,
		}).code;
	}

	// Running Lightning CSS twice to ensure that adjacent rules are merged after
	// nesting is applied. This creates a more optimized output.
	return optimize(optimize(Buffer.from(input))).toString();
}

function idToPath(id: string) {
	return path.resolve(id.replace(/\?.*$/, ""));
}

// The Vite extension has two types of sources for candidates:
//
// 1. The module graph: These are all modules that vite transforms and we want
//    them to be automatically scanned for candidates.
// 2. Root defined `@source`s
//
// Module graph candidates are global to the Vite extension since we do not
// know which CSS roots will be used for the modules. We are using a custom
// scanner instance with auto source discovery disabled to parse these.
//
// For candidates coming from custom `@source` directives of the CSS roots, we
// create an individual scanner for each root.
//
// Note: To improve performance, we do not remove candidates from this set.
// This means a longer-ongoing dev mode session might contain candidates that
// are no longer referenced in code.
const moduleGraphCandidates = new DefaultMap<string, Set<string>>(() =>
	new Set<string>()
);
const moduleGraphScanner = new Scanner({});

function scanFile(
	id: string,
	content: string,
	extension: string,
) {
	let updated = false;
	for (
		const candidate of moduleGraphScanner.scanFiles([{ content, extension }])
	) {
		updated = true;
		moduleGraphCandidates.get(id).add(candidate);
	}

	return updated;
}

function getExtension(id: string) {
	const [filename] = id.split("?", 2);
	return path.extname(filename).slice(1);
}

// Looks for tailwind class names in source files.
const scanCandidates: Plugin = {
	name: "tailwind-scan",
	transform(src, id, { moduleType }) {
		if (moduleType == "css") return;

		scanFile(id, src, getExtension(id));
	},
};

const transformPlugin: Plugin = {
	name: "tailwind-transform",

	// Assumption: only one root file.
	async transform(src, id, { moduleType }) {
		if (moduleType != "css") return;

		const root = new Root(id, () => moduleGraphCandidates, path.dirname(id));
		const generated = await root.generate(
			src,
			(file) => this.addWatchFile(file),
		);
		if (!generated) return src;

		return { code: generated };
	},

	// Minify.
	generateBundle(opts, bundle) {
		Object.values(bundle).forEach((chunk) => {
			if (!chunk.fileName.endsWith(".css") || chunk.type != "asset") return;
			// overwrite it
			this.emitFile({
				type: "asset",
				fileName: chunk.fileName,
				source: optimizeCss(
					chunk.source as string,
					chunk.fileName,
					!!opts.minify,
				),
			});
		});
	},
};

export default [scanCandidates, transformPlugin];
