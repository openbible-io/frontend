/**
 * This store is shared between all clients and the single service worker.
 */
import { createMergeableStore, type Tables } from "tinybase/with-schemas";
import { createBroadcastChannelSynchronizer } from "tinybase/synchronizers/synchronizer-broadcast-channel/with-schemas";
import publications from "../../shared/publications.ts";

// Settings.
export const valueSchema = {
	lang: { type: "string" }, // Language
	theme: { type: "string" }, // 'light' | 'dark' | 'device'
} as const;
export type ValueSchema = typeof valueSchema;

export const tableSchema = {
	task: {
		verb: { type: "string" },
		directObject: { type: "string" },
		thread: { type: "string" },
		cur: { type: "number" },
		total: { type: "number" },
		status: { type: "string" },
	},
	author: { // id: url
		name: { type: "string" },
		qualifications: { type: "string" },
	},
	toc: {
		publication: { type: "string" },
		book: { type: "string" },
		name: { type: "string" },
		nChapters: { type: "number" },
	},
	audio: {
		publication: { type: "string" },
		downloadUrl: { type: "string" },
		license: { type: "string" },
		licenseUrl: { type: "string" },
		publisher: { type: "string" },
		publisherUrl: { type: "string" },
		publishDate: { type: "string" },
		runtime: { type: "number" },
		size: { type: "number" },
	},
	audio_author: {
		audio: { type: "string" },
		author: { type: "string" },
	},
	publication: {
		title: { type: "string" },
		lang: { type: "string" },
		downloadUrl: { type: "string" },
		publisher: { type: "string" },
		publisherUrl: { type: "string" },
		publishDate: { type: "string" },
		isbn: { type: "number" },
		license: { type: "string" },
		licenseUrl: { type: "string" },
		size: { type: "number" },
	},
	publication_author: {
		publication: { type: "string" },
		author: { type: "string" },
		contributions: { type: "string" },
	},
} as const;
export type TableSchema = typeof tableSchema;

export function defaultTables(): Tables<TableSchema, true> {
	const res: Tables<TableSchema, true> = {
		publication: {},
		toc: {},
		author: {},
		publication_author: {},
		audio: {},
		audio_author: {},
	};
	Object.entries(publications).forEach(([k, v]) => {
		const { toc, authors, audio, ...rest } = v;
		res.publication![k] = rest;

		let i = 0;
		Object.entries(toc).forEach(([k2, v2]) => {
			res.toc![i++] = {
				publication: k,
				book: k2,
				...v2,
			};
		});
		authors?.forEach((v) => {
			res.author![v.url] = {
				name: v.name,
				qualifications: v.qualifications?.join("\n"),
			};
			let i = 0;
			res.publication_author![i++] = {
				publication: k,
				author: v.url,
				contributions: v.contributions?.join("\n"),
			};
		});
		Object.entries(audio ?? {}).forEach(([k2, v2]) => {
			const { authors, ...rest } = v2;
			let i = 0;
			(authors ?? []).forEach((v3) => {
				res.author![v3.url] = {
					name: v3.name,
					qualifications: v3.qualifications?.join("\n"),
				};
				res.audio_author![i++] = {
					author: v3.url,
					audio: k2,
				};
			});
			res.audio![k2] = { publication: k, ...rest };
		});
	});
	console.log(res);
	return res;
}

export default function init() {
	const res = createMergeableStore()
		.setValuesSchema(valueSchema)
		.setTablesSchema(tableSchema)
		.setTables(defaultTables());
	createBroadcastChannelSynchronizer(res, "shared").startSync();
	return res;
}
export type SharedStore = ReturnType<typeof init>;
