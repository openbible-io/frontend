import { type Publication } from "../../shared/publications.ts";
import { type Locale } from "../../shared/i18n.ts";

declare const self: ServiceWorkerGlobalScope;
const cacheId = "v1";
const getCache = () => caches.open(cacheId);

function onActivate() {
	console.log("activate", cacheId);
}

let initializing = false;

async function init(
	source: Client | ServiceWorker | MessagePort | null,
	toCache: string[],
	lang: Locale,
) {
	if (initializing) return;
	initializing = true;

	const cache = await getCache();
	const toUpdate: string[] = [];
	for (const url of toCache) {
		const cached = await cache.match(url);
		if (!cached) {
			toUpdate.push(url);
			//const old = await cache.matchAll(url, { ignoreSearch: true });
			//for (const toPurge of old) {
			//	console.log("purge", toPurge.url);
			//	await cache.delete(toPurge.url);
			//}
		}
	}

	if (toUpdate.length > 0) {
		source?.postMessage({ type: "initAppCache", toUpdate });
	}

	await Promise.all(toUpdate.map((pathname) => {
		source?.postMessage({ type: "initAppCacheProgress", pathname });
		console.log("add", pathname);
		return cache.add(pathname);
	}));

	initializing = false;

	console.log("local upsert default bible for", lang);
}

export type Message =
	| { type: "skipWaiting" }
	| { type: "init"; toCache: string[]; lang: Locale }
	| { type: "add"; publication: Publication };

async function onMessage(ev: ExtendableMessageEvent) {
	const msg = ev.data as Message;
	switch (msg.type) {
		case "skipWaiting":
			console.log("skipWaiting", cacheId);
			self.skipWaiting();
			break;
		case "init":
			await init(ev.source, msg.toCache, msg.lang);
			break;
		case "add":
			break;
		default:
			throw Error("Unknown message " + ev.data.type);
	}
}

async function networkThenCache(request: Request): Promise<Response> {
	try {
		return await fetch(request);
	} catch {
		const cache = await getCache();
		const cached = await cache.match(request);
		if (cached) return cached;
	}
	throw Error("Network offline and uncached: " + request.url);
}

async function cacheThenNetwork(request: Request): Promise<Response> {
	//const url = new URL(request.url);

	const cache = await getCache();
	const cached = await cache.match(request);
	if (cached) {
		//console.log("hit", url.toString());
		return cached;
	}

	//console.log("miss", url.toString());
	return fetch(request);
}

// Once installed, this handles all fetch requests.
// Its possible that `init` was not have been called before.
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
