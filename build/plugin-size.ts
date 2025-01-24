import type { Plugin } from "rolldown";
import { createGzip } from "node:zlib";
import Stream, { pipeline, Readable } from "node:stream";
import { promisify } from "node:util";
import { filesize } from "filesize";
import { markdownTable } from "markdown-table";

const compressedFormats = [".woff2"];
const pipe = promisify(pipeline);
class NullStream extends Stream.Writable {
	bytesWritten = 0;

	override _write(
		chunk: string,
		__: string,
		callback: (error?: Error | null) => void,
	) {
		this.bytesWritten += chunk.length;
		callback();
	}
}

function readable(size: number) {
	return filesize(size, { precision: 3 });
}

type Row = {
	fname: string;
	size: number;
	gzip: number;
};
type MdRow = [[string, string, string, string]];
const toMdRow = ({ fname, size, gzip }: Row): MdRow => [[
	fname,
	readable(size),
	readable(gzip),
	(size / gzip).toPrecision(3),
]];

async function compressedSize(
	fname: string,
	code: string | Uint8Array,
): Promise<number> {
	if (compressedFormats.some((f) => fname.endsWith(f))) return code.length;

	const gzip = createGzip();
	const readStream = Readable.from(code);
	const writeStream = new NullStream();
	await pipe(readStream, gzip, writeStream);

	return writeStream.bytesWritten;
}

export default {
	name: "size",
	async generateBundle(_, bundle) {
		const rows = [];
		for (const e of Object.entries(bundle)) {
			const [fname, chunk] = e;
			if (fname.endsWith(".map")) continue;

			const code = "code" in chunk ? chunk.code : chunk.source;
			const gzip = await compressedSize(fname, code);

			rows.push({ fname, size: code.length, gzip });
		}
		const sorted = rows.sort((r1, r2) => r1.gzip - r2.gzip);
		let i18nJson = false;
		const agg: typeof rows[number] = rows
			.filter((cur) => {
				if (cur.fname.match(/i18n\/.*.json/)) {
					if (i18nJson) return false;
					i18nJson = true;
				}
				if (cur.fname.match(/i18n\/.*.html/)) return false;
				return true;
			})
			.reduce((acc, cur) => {
				acc.size += cur.size;
				acc.gzip += cur.gzip;
				return acc;
			}, { fname: `${rows.length} files`, size: 0, gzip: 0 });

		console.log(markdownTable(
			[["fname", "raw", "gzip ↓", "ratio"]].concat(
				...sorted.map(toMdRow),
				[["", "", "", ""]],
				toMdRow(agg),
			),
		));
	},
} as Plugin;
