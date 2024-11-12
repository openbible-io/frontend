import { MarkSpec, NodeSpec, Schema } from "prosemirror-model";

export const nodes = {
	doc: { content: "block+" },
	text: {
		group: "inline",
	},
	paragraph: {
		content: "inline*",
		group: "block",
		parseDOM: [{ tag: "p" }],
		toDOM: () => ["p", 0],
	},
	blockquote: {
		content: "block+",
		group: "block",
		defining: true,
		parseDOM: [{ tag: "blockquote" }],
		toDOM: () => ["blockquote", 0],
	},
	horizontal_rule: {
		group: "block",
		parseDOM: [{ tag: "hr" }],
		toDOM: () => ["hr"],
	},
	heading: {
		attrs: { level: { default: 1, validate: "number" } },
		content: "inline*",
		group: "block",
		defining: true,
		parseDOM: [
			{ tag: "h1", attrs: { level: 1 } },
			{ tag: "h2", attrs: { level: 2 } },
			{ tag: "h3", attrs: { level: 3 } },
			{ tag: "h4", attrs: { level: 4 } },
			{ tag: "h5", attrs: { level: 5 } },
			{ tag: "h6", attrs: { level: 6 } },
		],
		toDOM(node) {
			return ["h" + node.attrs.level, 0];
		},
	},
	//image: {
	//	inline: true,
	//	attrs: {
	//		src: { validate: "string" },
	//		alt: { default: null, validate: "string|null" },
	//		title: { default: null, validate: "string|null" },
	//	},
	//	group: "inline",
	//	draggable: true,
	//	parseDOM: [{
	//		tag: "img[src]",
	//		getAttrs(dom: HTMLElement) {
	//			return {
	//				src: dom.getAttribute("src"),
	//				title: dom.getAttribute("title"),
	//				alt: dom.getAttribute("alt"),
	//			};
	//		},
	//	}],
	//	toDOM(node) {
	//		const { src, alt, title } = node.attrs;
	//		return ["img", { src, alt, title }];
	//	},
	//},
	//hard_break: {
	//	inline: true,
	//	group: "inline",
	//	selectable: false,
	//	parseDOM: [{tag: "br"}],
	//	toDOM: () => ['br'],
	//},
} as { [k: string]: NodeSpec };

export const marks = {
	link: {
		attrs: {
			href: { validate: "string" },
			title: { default: null, validate: "string|null" },
		},
		inclusive: false,
		parseDOM: [{
			tag: "a[href]",
			getAttrs(dom: HTMLElement) {
				return {
					href: dom.getAttribute("href"),
					title: dom.getAttribute("title"),
				};
			},
		}],
		toDOM(node) {
			const { href, title } = node.attrs;
			return ["a", { href, title }, 0];
		},
	},
	em: {
		parseDOM: [
			{ tag: "i" },
			{ tag: "em" },
			{ style: "font-style=italic" },
			{ style: "font-style=normal", clearMark: (m) => m.type.name == "em" },
		],
		toDOM: () => ["em", 0],
	},
	strong: {
		parseDOM: [
			{ tag: "strong" },
			// This works around a Google Docs misbehavior where
			// pasted content will be inexplicably wrapped in `<b>`
			// tags with a font-weight normal.
			{
				tag: "b",
				getAttrs: (node: HTMLElement) =>
					node.style.fontWeight != "normal" && null,
			},
			{ style: "font-weight=400", clearMark: (m) => m.type.name == "strong" },
			{
				style: "font-weight",
				getAttrs: (value: string) =>
					/^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
			},
		],
		toDOM: () => ["strong", 0],
	},
} as { [k: string]: MarkSpec };

export const schema = new Schema({ nodes, marks });
