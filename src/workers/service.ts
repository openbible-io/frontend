import { type Publication } from "../../shared/publications.ts";
import hashFn from "../../shared/hash.ts";

declare const self: ServiceWorkerGlobalScope;
const cacheId = "v1";
const getCache = () => caches.open(cacheId);

type Hash = string;
type Manifest = { [pathname: string]: Hash };

self.addEventListener("activate", () => {
	console.log("activate", cacheId);
});

async function getManifest() {
	const cached = await (await getCache()).match("manifest");
	return cached?.json() ?? {};
}

async function setManifest(manifest: Manifest) {
	const cache = await getCache();
	const resp = new Response(JSON.stringify(manifest));
	cache.put("manifest", resp);
}

async function cacheNew(manifest: Manifest, source: Client | ServiceWorker | MessagePort | null) {
	const cache = await getCache();

	const promises: Promise<void>[] = [];
	for (const [pathname, hash] of Object.entries(manifest)) {
		const cachedHash = await getResponseHash(pathname);
		if (hash != cachedHash) {
			console.log("cacheNew", cacheId, pathname, hash, cachedHash);
			promises.push(cache.add(pathname));
		}
	}
	await Promise.all(promises);
	await setManifest(manifest);

	const count = promises.length;
	source?.postMessage({ type: "cacheNew", count });
}

type Message =
	| { type: "skipWaiting" }
	| { type: "cache"; manifest: Manifest }
	| { type: "add"; publication: Publication };

self.addEventListener("message", (ev) => {
	const msg = ev.data as Message;
	switch (msg.type) {
		case "skipWaiting":
			console.log("skipWaiting", cacheId);
			self.skipWaiting();
			break;
		case "cache":
			cacheNew(msg.manifest, ev.source);
			break;
		case "add":
			break;
		default:
			throw Error("Unknown message " + ev.data.type);
	}
});

async function networkThenCache(request: Request): Promise<Response> {
	try {
		return await fetch(request);
	} catch {
		const cached = await (await getCache()).match(request);
		if (cached) return cached;
	}
	throw Error("Network offline and uncached: " + request.url);
}

async function getResponseHash(request: RequestInfo | URL): Promise<string> {
	const cached = await (await getCache()).match(request);
	if (!cached) return "";

	const bytes = await cached.arrayBuffer();
	return hashFn(bytes);
}

async function cacheThenNetwork(request: Request): Promise<Response> {
	const url = new URL(request.url);

	const cachedHash = await getResponseHash(request);
	const manifest = await getManifest();
	const expectedHash = manifest[url.pathname];
	if (cachedHash == expectedHash) {
		//console.log("hit", url.pathname, cachedHash);
		return (await (await getCache()).match(request))!;
	}

	//console.log("miss", url.pathname, cachedHash, expectedHash);
	return fetch(request);
}

async function fetchStrategy(request: Request) {
	const url = new URL(request.url);

	let strategy = cacheThenNetwork;
	if (url.pathname == "/") {
		// Old worker needs to update manifest before `cacheNew` is called.
		try {
			const resp = await fetch(request);
			const text = await resp.text();
			const manifestString = text.match("window.MANIFEST=({.*});");
			if (manifestString && manifestString[1]) {
				const manifest = JSON.parse(manifestString[1]);
				await setManifest(manifest);
			}
			return new Response(text, { headers: resp.headers });
		} catch {
			// Offline or format changed
			strategy = networkThenCache;
		}
	}

	return strategy(request);
}

self.addEventListener("fetch", (ev) => {
	ev.respondWith(fetchStrategy(ev.request));
});
