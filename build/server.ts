// Simple static dev server with live reloading.
import type { Plugin } from "rolldown";
import { extname, join } from "node:path";
import EventEmitter from "node:events";
import { contentType } from "@std/media-types";
import { dir } from "./config.ts";

const liveReload = Deno.readTextFileSync(
	join(import.meta.dirname!, "liveReload.js"),
);
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
					listener = (ev) => {
						const msg = new TextEncoder().encode(
							`event: change\ndata: ${JSON.stringify(ev)}\n\n`,
						);
						controller.enqueue(msg);
					};
					emitter.addListener("change", listener);
				},
				cancel() {
					emitter.removeListener("change", listener);
				},
			});
			return new Response(body, {
				headers: { "content-type": "text/event-stream" },
			});
		}
		let path = join(dir, url.pathname);

		let stat;
		try {
			stat = await Deno.stat(path);
			if (!stat.isFile) throw Error(`${path} not a file`);
		} catch (e) {
			let status = 500;
			path = join(dir, "index.html");
			try {
				stat = await Deno.stat(path);
				if (!stat.isFile) throw Error(`${path} not a file`);
			}
			catch (e2) {
				if (e2 instanceof Deno.errors.NotFound) status = 404;
				return new Response(`stat ${path}: ${e2}`, { status });
			}
			if (!stat) return new Response((e as Error).toString(), { status });
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
				"content-length": stat.size.toString(),
				"content-type": ty,
			},
		});
	},
} as Deno.ServeTcpOptions & Deno.ServeInit<Deno.NetAddr>;

export const plugin: Plugin = {
	name: "emit change to dev server",
	writeBundle() {
		emitter.emit("change");
	},
};
