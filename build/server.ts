// Simple static dev server with live reloading.
import { extname, join } from "node:path";
import EventEmitter from "node:events";
import { contentType } from "@std/media-types";
import { dir } from "./config.ts";
import { FancyAnsi } from "fancy-ansi";

const ansi = new FancyAnsi();

const liveReload = Deno.readTextFileSync(
	join(import.meta.dirname!, "liveReload.js"),
);

type WatcherMessage = { type: "change" } | {
	type: "error";
	raw: string;
	html: string;
};
declare interface Emitter {
	addListener(event: "watcher", listener: (msg: WatcherMessage) => void): this;
}
class Emitter extends EventEmitter {
	lastError?: { type: "error"; raw: string; html: string };

	change() {
		this.lastError = undefined;
		this.emit("watcher", { type: "change" });
	}
	error(raw: string) {
		const html = ansi.toHtml(raw).replaceAll("\n", "<br>");
		this.lastError = { type: "error", raw, html };
		this.emit("watcher", this.lastError);
	}
}
export const emitter = new Emitter();
emitter.addListener("watcher", () => {}); // To prevent `.emit` from blocking.

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
		// Unfortunately service workers intercept SSE streams and prevent a new
		// worker from activating until its closed.
		// Web workers can't currently touch websockets, so use that instead.
		if (url.pathname == "/liveReload") {
			if (req.headers.get("upgrade") != "websocket") {
				return new Response(null, { status: 501 });
			}

			const { socket, response } = Deno.upgradeWebSocket(req);

			let listener: (ev: WatcherMessage) => void;
			socket.addEventListener("open", () => {
				listener = (ev) => {
					socket.send(JSON.stringify(ev));
				};
				emitter.addListener("watcher", listener);
				if (emitter.lastError) listener(emitter.lastError);
			});
			socket.addEventListener("close", () => {
				emitter.removeListener("watcher", listener);
			});

			return response;
		}

		let path = join(dir, url.pathname);
		let stat;
		try {
			stat = await Deno.stat(path);
			if (!stat.isFile) throw Error(`${path} not a file`);
		} catch (e) {
			if (extname(path) != ".html" && extname(path) != "") {
				return new Response((e as Error).toString(), { status: 404 });
			}
			let status = 500;
			path = join(dir, "index.html");
			try {
				stat = await Deno.stat(path);
				if (!stat.isFile) throw Error(`${path} not a file`);
			} catch (e2) {
				if (e2 instanceof Deno.errors.NotFound) status = 404;
				return new Response(`stat ${path}: ${e2}`, { status });
			}
			if (!stat) return new Response((e as Error).toString(), { status });
		}

		// Cloudflare uses weak etags.
		const etag = `W/"${(stat.mtime!.getTime() * stat.size).toString(16)}"`;
		if (req.headers.get("if-none-match") == etag) {
			return new Response(null, { status: 304 });
		}

		const ty = contentType(extname(path)) || "application/octet-stream";
		let body;
		if (ty.includes("text/html")) {
			body = await Deno.readTextFile(path);
			body = body.replace(
				"</body>",
				`<script id="liveReload">${liveReload}</script></body>`,
			);
		} else {
			body = await Deno.readFile(path);
		}

		return new Response(body, {
			headers: {
				"content-length": stat.size.toString(),
				"content-type": ty,
				// spoof cloudflare headers that may cause app problems
				// https://developers.cloudflare.com/pages/configuration/serving-pages/
				"access-control-allow-origin": "*",
				"cache-control": "public, max-age=0, must-revalidate",
				etag,
			},
		});
	},
} as Deno.ServeTcpOptions & Deno.ServeInit<Deno.NetAddr>;
