import type {
	EmittedAsset,
	Plugin,
	PluginContext,
	RolldownOutputAsset,
	RolldownOutputChunk,
} from "rolldown";
import sharp from "sharp";
import { basename, extname } from "node:path";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import hash from "../shared/hash.ts";

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
	scripts: {
		entries: string[];
		other: string[];
	};
	stylesheets: string[];
	webmanifest?: string;
	manifest: { [fname: string]: string };
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
			const { icon: { sizes }, fileName: fileNameManifest, ...rest } =
				webmanifest;
			if (!icon) throw Error("must provide icon for webmanifest");
			const fileName = icon.fileName;
			const rootName = basename(fileName, extname(fileName));

			const icons = [{ src: base + fileName, sizes: "any" }];
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
				fileName: fileNameManifest,
				source: JSON.stringify({ icons, ...rest }),
			});
		}
	},
} as Plugin);

const htmlPlugin = ({
	base = "/",
	favicon: faviconPath,
	webmanifest,
	html,
}: Options) => ({
	name: "manifest",

	generateBundle: {
		order: "post",
		async handler(_, bundle) {
			type Hash = string; // sha256 base64 hash
			const manifest: { [fname: string]: Hash } = {};

			// 3. Create JSON manifest for service worker
			const scripts = { entries: [] as string[], other: [] as string[] };
			const stylesheets: string[] = [];
			for (const chunk of Object.values(bundle)) {
				if (chunk.fileName.endsWith(".map")) continue;

				const path = base + chunk.fileName;

				if (chunk.fileName.endsWith(".js") && chunk.type == "chunk") {
					scripts[chunk.isEntry ? "entries" : "other"].push(path);
				} else if (chunk.fileName.endsWith(".css")) {
					stylesheets.push(path);
				}

				manifest[path] = await hashChunk(chunk);
			}

			// 4. Emit HTML
			const props: HtmlProps = {
				scripts,
				stylesheets,
				manifest,
				webmanifest: base + webmanifest?.fileName,
			};
			if (faviconPath) {
				const asset = Object.values(bundle).find((v) =>
					v.type == "asset" && v.originalFileName == faviconPath
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

function emitAsset(ctx: PluginContext, path: string): RolldownOutputAsset {
	const info = assetInfo(path);
	const id = ctx.emitFile(info);
	const fileName = ctx.getFileName(id);

	return {
		type: "asset",
		fileName,
		originalFileName: path,
		source: info.source,
		name: info.name,
	};
}

function getSource(
	chunk: RolldownOutputAsset | RolldownOutputChunk,
): Uint8Array {
	const code = "code" in chunk ? chunk.code : chunk.source;
	return typeof code == "string" ? new TextEncoder().encode(code) : code;
}

function hashChunk(chunk: RolldownOutputAsset | RolldownOutputChunk) {
	const source = getSource(chunk);
	return hash(source);
}
