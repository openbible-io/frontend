import { type Publication } from "../../shared/publications.ts";

declare const self: ServiceWorkerGlobalScope;
const cacheId = "v1";
const getCache = () => caches.open(cacheId);

function onActivate() {
	console.log("activate", cacheId);
	self.clients.claim();
}

export type Message =
	| { type: "skipWaiting" }
	| { type: "claimMe" }
	| { type: "add"; publication: Publication };

async function onMessage(ev: ExtendableMessageEvent) {
	const msg = ev.data as Message;
	switch (msg.type) {
		case "skipWaiting":
			console.log("skipWaiting", cacheId);
			ev.waitUntil(self.skipWaiting());
			break;
		case "claimMe":
			self.clients.claim();
			ev.source?.postMessage("claimed");
			break;
		case "add":
			break;
		default:
			throw Error("Unknown message " + ev.data);
	}
}

async function networkThenCache(request: Request): Promise<Response> {
	const cache = await getCache();

	try {
		const resp = await fetch(request);
		await cache.put(request, resp);
		return cache.match(request) as Promise<Response>;
	} catch {
		const cached = await cache.match(request);
		if (cached) return cached;
	}
	throw Error("Network offline and uncached: " + request.url);
}

async function cacheThenNetwork(request: Request): Promise<Response> {
	const cache = await getCache();
	const cached = await cache.match(request);
	if (cached) {
		//console.log("hit", request.url);
		return cached;
	}

	//console.log("miss", request.url);
	return networkThenCache(request);
}

// Once installed, this handles all fetch requests.
// It's possible that `init` has not been called before.
function onFetch(ev: FetchEvent) {
	const url = new URL(ev.request.url);
	//console.log("onFetch", url.toString());

	if (url.origin == self.origin && !url.pathname.match(/\.[^\/]+$/)) {
		console.log("is root", url.pathname);
		return networkThenCache(new Request("/"));
	}

	return cacheThenNetwork(ev.request);
}

self.addEventListener("activate", onActivate);
self.addEventListener("message", (ev) => ev.waitUntil(onMessage(ev)));
self.addEventListener("fetch", (ev) => ev.respondWith(onFetch(ev)));
