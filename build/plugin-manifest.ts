import type {
	EmittedAsset,
	OutputAsset,
	OutputChunk,
	Plugin,
	PluginContext,
} from "rolldown";
import sharp from "sharp";
import { basename, extname } from "node:path";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import hashFn from "../shared/hash.ts";

export interface Options {
	base?: string;
	favicon?: string;
	webmanifest?: WebManifest;
	html: (props: HtmlProps) => Promise<{ [fname: string]: string }>;
}
/**
 * Chromium-based browsers require:
 * - name or short_name
 * - icons must contain a 192px and a 512px icon
 * - start_url
 * - display and/or display_override
 * - prefer_related_applications must be false or not present
 */
// deno-lint-ignore no-explicit-any
export interface WebManifest extends Record<string, any> {
	name: string;
	display: string;
	icon?: {
		/** Defaults to favicon */
		path?: string;
		/**
		 * Will resize `icon` to square NxN icons.
		 * Chromium-based browsers require 192 and 512.
		 * Defaults to [192, 512].
		 */
		sizes?: number[];
	};
	/** Defaults to `base`. */
	start_url?: string;
	/** Defaults to "index.webmanifest". */
	fileName?: string;
}
export interface HtmlProps {
	favicon?: string;
	entrypoints: string[];
	webmanifest?: string;
	rest: string[];
	dir: string;
}

const manifestPlugin = ({
	base = "/",
	favicon: faviconPath,
	webmanifest,
}: Options) => ({
	name: "manifest",

	async generateBundle() {
		// 1. Emit icons
		if (faviconPath) emitAsset(this, faviconPath);
		const icon = webmanifest?.icon?.path &&
			emitAsset(this, webmanifest.icon.path);

		// 2. Emit webmanifest
		if (webmanifest && webmanifest.icon) {
			const {
				icon: { sizes },
				fileName: fileNameManifest,
				...rest
			} = webmanifest;
			if (!icon) throw Error("must provide icon for webmanifest");
			const fileName = webmanifest.icon.path!;
			const rootName = basename(fileName, extname(fileName));

			const icons = [{ src: base + icon.fileName, sizes: "any" }];
			const img = sharp(icon.source);
			for (const size of sizes!) {
				const resized = img.resize(size);
				const source = await resized.toFormat("png").toBuffer();
				const name = `${rootName}-${size}.png`;
				const mId = this.emitFile({ type: "asset", name, source });
				const fileName = this.getFileName(mId);
				icons.push({ src: base + fileName, sizes: `${size}x${size}` });
			}
			this.emitFile({
				type: "asset",
				name: fileNameManifest,
				source: JSON.stringify({ icons, ...rest }),
			});
		}
	},
} as Plugin);

let dir = "";

const htmlPlugin = ({
	base = "/",
	favicon: faviconPath,
	webmanifest,
	html,
}: Options) => ({
	name: "manifest",

	renderStart(opts) {
		if (opts.dir) dir = opts.dir;
	},

	generateBundle: {
		order: "post",
		async handler(_, bundle) {
			const rest: string[] = [];

			// 3. Create manifest for service worker to cache
			let webmanifestPath = "";
			const entrypoints: string[] = [];

			for (const chunk of Object.values(bundle)) {
				if (chunk.fileName.endsWith(".map")) continue;

				const path = base + chunk.fileName;

				if (chunk.type == "chunk" && chunk.isEntry) {
					entrypoints.push(path);
				} else if (chunk.fileName.endsWith(".css")) {
					entrypoints.push(path);
				} else if (
					chunk.type == "asset" &&
					chunk.names.includes(webmanifest?.fileName ?? "")
				) {
					webmanifestPath = path;
				} else {
					rest.push(path);
				}
			}

			// 4. Emit HTML
			const props: HtmlProps = {
				entrypoints,
				webmanifest: webmanifestPath,
				rest,
				dir,
			};
			if (faviconPath) {
				const asset = Object.values(bundle).find((v) =>
					v.type == "asset" && v.originalFileNames.includes(faviconPath)
				);
				if (asset) {
					props.favicon = base + asset?.fileName;
				} else {
					this.error("could not find emitted favicon");
				}
			}

			const indices = await html(props);
			Object.entries(indices).forEach(([fileName, source]) =>
				this.emitFile({ type: "asset", fileName, source })
			);
		},
	},
} as Plugin);

export default (opts: Options) => {
	if (opts.webmanifest) {
		opts.webmanifest.icon = {
			path: opts.favicon,
			sizes: [128, 512],
			...opts.webmanifest.icon,
		};
		opts.webmanifest = {
			start_url: opts.base,
			fileName: "index.webmanifest",
			...opts.webmanifest,
		};
	}

	return [manifestPlugin(opts), htmlPlugin(opts)];
};

const assetInfo = (originalFileName: string): EmittedAsset => ({
	type: "asset",
	name: basename(originalFileName),
	source: readFileSync(originalFileName) as Buffer,
	originalFileName,
});

function emitAsset(ctx: PluginContext, path: string): OutputAsset {
	const info = assetInfo(path);
	const id = ctx.emitFile(info);
	const fileName = ctx.getFileName(id);

	return {
		type: "asset",
		fileName,
		originalFileName: path,
		originalFileNames: [path],
		source: info.source,
		name: info.name,
		names: [info.name!],
	};
}

function getSource(
	chunk: OutputAsset | OutputChunk,
): Uint8Array {
	const code = "code" in chunk ? chunk.code : chunk.source;
	return typeof code == "string" ? new TextEncoder().encode(code) : code;
}

function hashChunk(chunk: OutputAsset | OutputChunk) {
	const source = getSource(chunk);
	return hashFn(source);
}
