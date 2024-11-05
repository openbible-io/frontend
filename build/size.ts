import { join } from "node:path";
import { createReadStream, readdirSync, statSync } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import {filesize} from "filesize";
import { markdownTable } from 'markdown-table';
import Stream from "node:stream";

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

async function dirStats(d: string) {
	const res = [];
	const sorted = readdirSync(d, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name)
	);
	for (const s of sorted) {
		if (s.isDirectory()) return await dirStats(join(d, s.name));
		const fname = join(d, s.name);
		const stat = statSync(fname);
		const gzip = createGzip();
		const writeStream = new NullStream();
		await pipe(createReadStream(fname), gzip, writeStream);
		res.push({ fname, size: stat.size, gzip: writeStream.bytesWritten });
	}
	return res;
}

export default async function report(dir: string) {
	const stats = await dirStats(dir);
	console.log(
		markdownTable(
			[['fname', 'raw', 'gzip', 'ratio']].concat(
			stats.map(s => [s.fname, filesize(s.size, { precision: 3 }), filesize(s.gzip, { precision: 3 }), (s.size / s.gzip).toPrecision(3)]))
		)
	);
}
