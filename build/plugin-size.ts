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

export default {
	name: "size",
	async generateBundle(_, bundle) {
		const rows = [["fname", "raw", "gzip", "ratio"]];
		for (const e of Object.entries(bundle)) {
			const [k, v] = e;
			if (k.endsWith(".map")) continue;

			const gzip = createGzip();
			const raw = v.code ?? v.source ?? "";
			const readStream = Readable.from(raw);
			const writeStream = new NullStream();
			await pipe(readStream, gzip, writeStream);
			rows.push([
				k,
				readable(raw.length),
				readable(writeStream.bytesWritten),
				(raw.length / writeStream.bytesWritten).toPrecision(3),
			]);
		}
		console.log(markdownTable(rows));
	},
} as Plugin;
