/**
 * This plugin:
 * 1. Parses HTML into entrypoints.
 * 2. Injects HTML based on template.
 *
 * It is based on the philosophy that HTML should be a lightweight index
 * of links to other files.
 */
import type { Plugin } from "rolldown";
import langs, { Language } from "../shared/i18n.ts";
import { render } from "preact-render-to-string";
import { h } from "preact";
import sharp from "sharp";
// TODO:
// 1.  pass this import as a config option
// 2. dynamically import it
// 3. watch it for changes
// 4. publish it :)
import Template, { type Props } from "../src/index.tsx";
import { basename, extname } from "node:path";

const base = "/";
const webmanifest = {
	path: "index.webmanifest",
	sizes: [128, 512],
};

let writtenManifest = false;

export default {
	name: "html",

	async generateBundle(_, bundle) {
		let entry = "";
		let favicon = {
			fileName: '',
			path: "",
			code: new Uint8Array(),
		};
		const scripts: string[] = [];
		const stylesheets: string[] = [];
		const manifest: { [fname: string]: string } = {};

		for (const chunk of Object.values(bundle)) {
			if (chunk.fileName.endsWith(".map")) continue;

			const code = "code" in chunk ? chunk.code : chunk.source;

			if (chunk.fileName.endsWith(".js")) {
				if (
					chunk.type == "chunk" && chunk.isEntry &&
					!chunk.facadeModuleId?.match(/workers\/[^\/]*$/)
				) {
					if (entry) {
						this.warn(`entrypoint ${chunk.fileName} overwrites ${entry}`);
					}
					entry = base + chunk.fileName;
				} else scripts.push(base + chunk.fileName);
			} else if (chunk.fileName.endsWith(".css")) {
				stylesheets.push(base + chunk.fileName);
			} else if (chunk.fileName.match(/favicon\.[^./]*$/)) {
				favicon = {
					fileName: chunk.fileName,
					path: basename(chunk.fileName, extname(chunk.fileName)),
					code: typeof code == "string" ? new TextEncoder().encode(code) : code,
				};
			}

			if (!code) this.warn(`empty chunk ${chunk.fileName}`);
			const source = typeof code == "string"
				? new TextEncoder().encode(code)
				: code;
			const buffer = await crypto.subtle.digest("sha-256", source);
			const arr = Array.from(new Uint8Array(buffer));
			const hash = arr.map((i) => i.toString(16).padStart(2, "0")).join("");
			manifest[chunk.fileName] = hash;
		}

		for (const e2 of Object.entries(langs)) {
			const [lang, imp] = e2;
			const dict = (await imp()).default;

			const props: Props = {
				lang: lang as Language,
				noscript: dict.noscript,
				entry,
				favicon: "asdf.svg",
				scripts,
				stylesheets,
				manifest,
				webmanifest: webmanifest.path,
			};

			const template = h(Template, props);
			const source = render(template);
			const fileName = `i18n/${lang}/index.html`;
			this.emitFile({ type: "asset", source, fileName });
			if (lang == "eng") {
				this.emitFile({ type: "asset", source, fileName: "index.html" });
			}
		}

		if (!writtenManifest) {
			const icons = [{ src: base + favicon.fileName, sizes: "any" }];
			const img = sharp(favicon.code);
			for (const size of webmanifest.sizes) {
				const resized = img.resize(size);
				const source = await resized.toFormat("png").toBuffer();
				const name = `${favicon.path}-${size}.png`;
				const mId = this.emitFile({ type: "asset", name, source });
				const fileName = this.getFileName(mId);
				icons.push({ src: base + fileName, sizes: `${size}x${size}` });
			}
			const source = JSON.stringify({
				name: "OpenBible",
				icons,
				start_url: base,
				display: "standalone",
				background_color: "#f2f2f2",
				theme_color: "#0b8dc4",
			});
			this.emitFile({ type: "asset", fileName: webmanifest.path, source });
			writtenManifest = true;
		}
	},
} as Plugin;
