/**
 * This store is shared between all clients and the single service worker.
 */
import { createMergeableStore } from "tinybase/with-schemas";
import { createBroadcastChannelSynchronizer } from "tinybase/synchronizers/synchronizer-broadcast-channel/with-schemas";

// Settings.
export const valueSchema = {
	lang: { type: "string" }, // Language
	theme: { type: "string" }, // 'light' | 'dark' | 'device'
} as const;
export type ValueSchema = typeof valueSchema;

export const tableSchema = {
	task: {
		id: { type: "string" }, // rowId
		verb: { type: "string" },
		directObject: { type: "string" },
		thread: { type: "string" },
		cur: { type: "number" },
		total: { type: "number" },
		status: { type: "string" },
	},
	author: {
		url: { type: "string" },
		name: { type: "string" },
		qualifications: { type: "string" },
		contributions: { type: "string" },
	},
	toc: {
		id: { type: "string" },
		title: { type: "string" },
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
		id: { type: "string" },
		title: { type: "string" },
		lang: { type: "string" },
		downloadUrl: { type: "string" },
		publisher: { type: "string" },
		publisherUrl: { type: "string" },
		publishDate: { type: "string" },
		isbn: { type: "number" },
		license: { type: "string" },
		licenseUrl: { type: "string" },
		toc: { type: "string" },
		size: { type: "number" },
	},
	publication_author: {
		publication: { type: "string" },
		author: { type: "string" },
	},
} as const;
export type TableSchema = typeof tableSchema;

export default function init() {
	const res = createMergeableStore()
		.setValuesSchema(valueSchema)
		.setTablesSchema(tableSchema);
	createBroadcastChannelSynchronizer(res, "shared").startSync();
	return res;
}
export type SharedStore = ReturnType<typeof init>;
