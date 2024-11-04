import sharedInit from "../stores/shared.ts";
import { type Publication } from "../publications.ts";
import { type ITag, type IText, parse } from "html5parser";
import Task, { type Opts as TaskOpts } from "../task.ts";

declare const self: ServiceWorkerGlobalScope;
const cacheId = "v1";

const shared = sharedInit();

// Run for very first time.
self.addEventListener("install", () => {
	console.log("install");
	// The promise that skipWaiting() returns can be safely ignored.
	self.skipWaiting();
});

function newTask(name: string, opts?: TaskOpts) {
	return new Task(shared, "service", name, opts);
}

async function cacheNew(urls: RequestInfo[]) {
	const task = newTask("caching", {
		total: urls.length,
		directObject: "URLs",
	});

	const c = await caches.open(cacheId);
	const uncached: RequestInfo[] = [];
	for (const u of urls) {
		if (!await c.match(u)) {
			uncached.push(u);
		} else {
			task.cur++;
		}
	}

	task.do(uncached, (u) => c.add(u));
}

async function addPub(pub: Publication) {
	let task = newTask("downloading", {
		directObject: pub.title,
		total: pub.size,
	});
	const url = `${pub.url}/all`;
	const resp = await fetch(url);
	const reader = resp.body!.getReader();

	let receivedLength = 0;
	const chunks: Uint8Array[] = [];
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		chunks.push(value);
		receivedLength += value.length;

		task.cur = receivedLength;
	}

	task = newTask("parsing", {
		directObject: pub.title,
	});
	task.status = "merging chunks";
	const chunksAll = new Uint8Array(receivedLength);
	let position = 0;
	for (const chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}

	task.status = "decoding utf-8";
	const html = new TextDecoder("utf-8").decode(chunksAll);
	task.status = "parsing html";
	const ast = parse(html);
	if (
		ast?.[0].type != "Tag" || ast?.[0].body?.length != 2 ||
		!Array.isArray((ast?.[0].body?.[1] as ITag)?.body)
	) throw Error("Invalid publication data");

	const body = (ast[0].body[1] as ITag).body as (IText | ITag)[];
	task.status = "converting html";
	task.total = body.length;
	for (let i = 0; i < body.length; i++) {
		if (i % 100 == 0) task.cur = i;
	}
	task.setDone();
}

self.addEventListener("message", (ev) => {
	switch (ev.data.type) {
		case "cache":
			// The browser doesn't trust "cache forever" headers when offline.
			cacheNew(ev.data.hrefs);
			break;
		case "add":
			addPub(ev.data.pub as Publication);
			break;
		default:
			throw Error("Unknown message " + ev.data.type);
	}
});

async function cacheThenNetwork(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;
	return fetch(request);
}

async function networkThenCache(request: Request): Promise<Response> {
	try {
		const network = await fetch(request);
		return network;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;
	}
	throw Error("Network offline and uncached: " + request.url);
}

const cacheForeverRe = new RegExp(
	import.meta.env.OPENBIBLE_CACHE_FOREVER_REGEX,
);

self.addEventListener("fetch", (ev) => {
	const strategy =
		(import.meta.env.PROD && ev.request.url.match(cacheForeverRe))
			? cacheThenNetwork
			: networkThenCache;
	ev.respondWith(strategy(ev.request));
});

// To please tsc
export default "";
