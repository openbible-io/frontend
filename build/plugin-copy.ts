import type { Plugin } from "rolldown";
import { dirname, join } from "node:path";
import { copy, ensureDir } from "@std/fs";

async function doCopy(srcDir: string, dstDir: string) {
	for await (const dirEntry of Deno.readDir(srcDir)) {
		const src = join(srcDir, dirEntry.name);
		const dst = join(dstDir, dirEntry.name);
		await ensureDir(dirname(dst));
		await copy(src, dst, { overwrite: true });
	}
}

export default function copyPlugin(paths: string[]): Plugin {
	let cwd = Deno.cwd();
	let outDir = "";
	return {
		name: "copy",
		async renderStart(opts, inOpts) {
			if (inOpts.cwd) cwd = inOpts.cwd;
			if (opts.dir) {
				outDir = opts.dir;
				await Promise.all(paths.map((p) => doCopy(join(cwd, p), opts.dir!)));
				paths.forEach((p) => this.addWatchFile(p));
			}
		},
		async watchChange(absPath, { event }) {
			for (const p of paths) {
				const baseDir = join(cwd, p);
				if (!absPath.startsWith(baseDir)) continue;

				const extPath = absPath.substring(baseDir.length);
				const dst = join(outDir, extPath);

				if (event == "delete") {
					await Deno.remove(dst);
				} else {
					await ensureDir(dirname(dst));
					await copy(absPath, dst, { overwrite: true });
				}
			}
		},
	};
}
