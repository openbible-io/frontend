import type { Plugin } from "rolldown";
import { createGzip } from "node:zlib";
import Stream, { pipeline, Readable } from "node:stream";
import { promisify } from "node:util";
import { filesize } from "filesize";
import { markdownTable } from "markdown-table";

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

export default {
	name: "size",
	async generateBundle(_, bundle) {
		const rows = [];
		for (const e of Object.entries(bundle)) {
			const [fname, chunk] = e;
			if (fname.endsWith(".map")) continue;

			const gzip = createGzip();
			const code = "code" in chunk ? chunk.code : chunk.source;
			const readStream = Readable.from(code);
			const writeStream = new NullStream();
			await pipe(readStream, gzip, writeStream);
			rows.push({
				fname,
				size: code.length,
				gzip: writeStream.bytesWritten,
			});
		}
		const sorted = rows.sort((r1, r2) => r1.size - r2.size);
		const agg: typeof rows[number] = rows.reduce((acc, cur) => {
			acc.size += cur.size;
			acc.gzip += cur.gzip;
			return acc;
		}, { fname: "TOTAL", size: 0, gzip: 0 });

		console.log(markdownTable(
			[["fname", "raw", "gzip", "ratio"]].concat(
				...sorted.map(toMdRow),
				[["", "", "", ""]],
				toMdRow(agg),
			),
		));
	},
} as Plugin;
