// Simple static dev server with live reloading.
import type { Plugin } from "rolldown";
import { extname, join } from "node:path";
import EventEmitter from "node:events";
import { contentType } from "@std/media-types";
import { dir } from "./config.ts";

const liveReload = Deno.readTextFileSync(
	join(import.meta.dirname!, "liveReload.js"),
);

let files = new Set<string>();
const emitter = new EventEmitter();

export default {
	hostname: "localhost",
	onListen({ hostname, port }) {
		console.log(
			"Listening on",
			`http://${hostname.replace("::1", "localhost")}:${port}`,
		);
	},
	async handler(req) {
		const url = new URL(req.url);
		if (url.pathname == "/liveReload") {
			let listener: (ev: Event) => void;
			const body = new ReadableStream({
				start(controller) {
					//console.log("sse connect");
					listener = (ev) => {
						//console.log("send", ev);
						const msg = new TextEncoder().encode(
							`event: change\ndata: ${JSON.stringify(ev)}\n\n`,
						);
						controller.enqueue(msg);
					};
					emitter.addListener("change", listener);
				},
				cancel() {
					//console.log("sse disconnect");
					emitter.removeListener("change", listener);
				},
			});
			return new Response(body, {
				headers: { "content-type": "text/event-stream" },
			});
		}
		if (url.pathname == "/") url.pathname = "/index.html";
		const path = join(dir, url.pathname);

		let filesize;
		try {
			filesize = (await Deno.stat(path)).size;
		} catch (e) {
			if (e instanceof Deno.errors.NotFound) {
				return new Response(null, { status: 404 });
			}
			return new Response(null, { status: 500 });
		}

		const ty = contentType(extname(path)) || "application/octet-stream";
		let body;
		if (ty.includes("text/html")) {
			body = await Deno.readTextFile(path);
			body = body.replace("</body>", `<script>${liveReload}</script></body>`);
		} else {
			body = (await Deno.open(path)).readable;
		}

		return new Response(body, {
			headers: {
				"content-length": filesize.toString(),
				"content-type": ty,
			},
		});
	},
} as Deno.ServeTcpOptions & Deno.ServeInit<Deno.NetAddr>;

export const plugin: Plugin = {
	name: "emit change to dev server",
	writeBundle(_, b) {
		const fileList = Object.keys(b).filter((f) => !f.endsWith(".map"));
		// Rely on files names containing hash contents.
		const newFiles = new Set<string>(fileList);
		if (files.size) {
			const added = Array.from(newFiles.difference(files));
			const removed = Array.from(files.difference(newFiles));
			// Disk space isn't free.
			//removed.forEach(r => Deno.remove(join(dir, r)));
			if (added.length || removed.length) {
				emitter.emit("change", { removed, added });
			}
		}
		files = newFiles;
	},
};
