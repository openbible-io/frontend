import { createMergeableStore } from "tinybase";
import { createBroadcastChannelSynchronizer } from "tinybase/synchronizers/synchronizer-broadcast-channel";
import { default as publications, type Publication } from "../publications.ts";
import type { Dictionary } from "../i18n.ts";
import { parse } from "html5parser";

declare const self: ServiceWorkerGlobalScope;
const cacheId = "v1";

/** Non-document state. */
const store = createMergeableStore();
const sync = createBroadcastChannelSynchronizer(store, "store");

function setState(verb?: keyof Dictionary, object?: string) {
	store.setValue("verb", verb ?? "");
	store.setValue("object", object ?? "");
}

// Run for very first time
// Persistent DB init
self.addEventListener("install", (ev) => {
	console.log("install");
	// The promise that skipWaiting() returns can be safely ignored.
	self.skipWaiting();
	ev.waitUntil(async function install() {
		const cache = await caches.open(cacheId);
		await cache.add("/");
	}());
});

async function deleteOldCaches() {
	const keys = await caches.keys();
	await Promise.all(keys.filter((k) => k != cacheId).map(caches.delete));
}

// All pages controlled by old version are gone
// Delete old version persistent DB
self.addEventListener("activate", (ev) => {
	console.log("activate");
	ev.waitUntil((async () => {
		await deleteOldCaches();
		await sync.startSync();
	})());
});

async function cacheNew(urls: RequestInfo[]) {
	const c = await caches.open(cacheId);
	const uncached: RequestInfo[] = [];
	for (const u of urls) {
		if (!await c.match(u)) uncached.push(u);
	}
	return c.addAll(uncached);
}

async function addPub(pub: Publication) {
	const url = `${pub.url}/all`;
	console.log("fetching", url);
	const resp = await fetch(url);
	const reader = resp.body!.getReader();

	const contentLength = pub.size;

	let receivedLength = 0;
	const chunks: Uint8Array[] = [];
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		chunks.push(value);
		receivedLength += value.length;

		console.log(`Received ${receivedLength} of ${contentLength}`);
	}

	const chunksAll = new Uint8Array(receivedLength);
	let position = 0;
	for (const chunk of chunks) {
		chunksAll.set(chunk, position); // (4.2)
		position += chunk.length;
	}

	const html = new TextDecoder("utf-8").decode(chunksAll);
	console.log("parsing", html.length);
	const ast = parse(html);

	//const doc1 = new Doc();
	//const store1 = createStore();
	//const persister1 = createYjsPersister(store1, doc1);
	//await persister1.startAutoLoad();
	//await persister1.startAutoSave();
}

self.addEventListener("message", (ev) => {
	console.log("msg", ev.data);
	switch (ev.data.type) {
		case "cache":
			// The browser doesn't trust "cache forever" headers when offline.
			setState("downloading", ev.data.hrefs.join(" "));
			cacheNew(ev.data.hrefs).then(() => setState());
			break;
		case "add":
			setState("downloading", ev.data.pub.title);
			addPub(ev.data.pub as Publication).then(() => setState());
			break;
		case "test":
			console.log(ev.data.test);
			break;
		default:
			throw Error("Handle message " + ev.data.type);
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

export default "";
