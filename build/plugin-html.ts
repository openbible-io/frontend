/**
 * This plugin:
 * 1. Parses HTML into entrypoints.
 * 2. Injects HTML based on template.
 *
 * It is based on the philosophy that HTML should be a lightweight index
 * of links to other files.
 */
import type { Plugin, RolldownOutputChunk } from "rolldown";
import publications from "../shared/publications.ts";
import langs from "../shared/i18n.ts";
import {
	IAttributeValue,
	INode,
	ITag,
	IText,
	parse as parseHtml,
	SyntaxKind,
	walk,
} from "html5parser";
import { basename, dirname, join } from "node:path";

type Ast = {
	root: INode[];
	html?: ITag;
	head?: ITag;
	links: ITag[];
	scripts: ITag[];
	body?: ITag;
};
const asts: { [fname: string]: Ast } = {};

function parse(s: string): Ast {
	const root = parseHtml(s, { setAttributeMap: true });
	const res: Ast = {
		root,
		links: [],
		scripts: [],
	};

	walk(root, {
		enter(node) {
			if (node.type != SyntaxKind.Tag) return;

			if (node.name == "html") res.html = node;
			else if (node.name == "head") res.head = node;
			else if (node.name == "body") res.body = node;
			else if (node.name == "link") res.links.push(node);
			else if (node.name == "script") res.scripts.push(node);
		},
	});
	return res;
}

const stringify = (ast: INode[]): string =>
	ast.map((node) => {
		if (node.type === SyntaxKind.Text) return node.value.trim();
		const attrs = node.attributes
			.map((a) =>
				`${a.name.value}${
					a.value?.value ? "=" + JSON.stringify(a.value.value) : ""
				}`
			)
			.join(" ");
		if (node.name == "!--") return "";
		const head = "<" + node.name + (attrs ? " " + attrs : "") + ">";
		if (!node.body || node.name == "link") return head;
		return head + stringify(node.body) + `</${node.name}>`;
	})
		.join("");

function textNode(value: string): IText {
	return { type: SyntaxKind.Text, value, start: 0, end: 0 };
}

function attributeValueNode(value: string): IAttributeValue {
	return { value, quote: '"', start: 0, end: 0 };
}

function attributeNode(key: string, value: string) {
	return {
		name: textNode(key),
		value: attributeValueNode(value),
		start: 0,
		end: 0,
	};
}

function tagNode(
	name: string,
	attributes: { [k: string]: string },
	body: INode[] = [],
): ITag {
	return {
		type: SyntaxKind.Tag,
		open: textNode(name),
		name,
		rawName: name,
		attributes: Object.entries(attributes).map(([k, v]) => attributeNode(k, v)),
		body,
		attributeMap: undefined,
		close: undefined,
		start: 0,
		end: 0,
	};
}

const ul = tagNode(
	"ul",
	{},
	Object.values(publications)
		.map(({ title, url }) =>
			tagNode("li", {}, [
				tagNode("a", { href: url }, [textNode(title)]),
			])
		),
);

export default {
	name: "html",

	async load(id) {
		if (!id.endsWith(".html")) return;

		const source = await Deno.readTextFile(id);
		asts[id] = parse(source);
		this.addWatchFile(id);

		const linkIds = asts[id].links
			.map((n) => n.attributeMap!.href.value?.value);
		const scriptIds = asts[id].scripts
			.map((n) => n.attributeMap!.src.value?.value);

		const code = linkIds
			.concat(scriptIds)
			.filter(Boolean)
			.map((n) => join(dirname(id), n!))
			.map((f) => `import ${JSON.stringify(f)};`).join("\n");

		return { moduleType: "js", code };
	},
	async generateBundle(_, bundle) {
		const scripts: INode[] = [];
		const manifest: { [fname: string]: string } = {};

		for (const chunk of Object.values(bundle)) {
			if (chunk.fileName.endsWith(".map")) continue;

			if (
				chunk.fileName.endsWith(".js") &&
				!(chunk as RolldownOutputChunk)?.isEntry
			) {
				scripts.push(tagNode("link", {
					rel: "modulepreload",
					href: `/${chunk.fileName}`,
				}));
			}

			const code = "code" in chunk ? chunk.code : chunk.source;
			if (!code) this.warn(`empty chunk ${chunk.fileName}`);
			const source = typeof code == "string"
				? new TextEncoder().encode(code)
				: code;
			const buffer = await crypto.subtle.digest("sha-256", source);
			const arr = Array.from(new Uint8Array(buffer));
			const hash = arr.map((i) => i.toString(16).padStart(2, "0")).join("");
			manifest[chunk.fileName] = hash;
		}

		for (const e1 of Object.entries(asts)) {
			const [fname, ast] = e1;
			const fileName = basename(fname, ".html");
			for (const e2 of Object.entries(langs)) {
				const [lang, imp] = e2;
				const dict = (await imp()).default;

				if (ast.html) ast.html.attributes.push(attributeNode("lang", lang));
				if (ast.head?.body) {
					// prep for render step
					walk(ast.head.body, {
						enter(n) {
							if (n.type != SyntaxKind.Tag) return;
							if (n.name != "script") return;
							const val = n.attributeMap!.src.value;
							if (val) val.value = val.value.replace(/\.[tj]sx?$/, ".js");
						},
					});
					ast.head.body.push(...scripts);
				}

				if (ast.body?.body) {
					ast.body.body.push(
						tagNode("noscript", {}, [
							textNode(dict.noscript ?? ""),
							ul,
						]),
						tagNode("script", {}, [
							textNode(`window.manifest=${JSON.stringify(manifest)}`),
						]),
					);
				}

				const source = stringify(ast.root);
				this.emitFile({
					type: "asset",
					source,
					fileName: `i18n/${lang}/${fileName}.html`,
				});
				if (lang == "eng") {
					this.emitFile({
						type: "asset",
						source,
						fileName: `${fileName}.html`,
					});
				}
			}
		}
	},
} as Plugin;
