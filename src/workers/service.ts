import { type Publication } from "../../shared/publications.ts";
import hashFn from "../../shared/hash.ts";
import { type Locale } from "../../shared/i18n.ts";

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

let initializing = false;

async function invalidFiles(manifest: Manifest): Promise<string[]> {
	const res = [];

	for (const [pathname, hash] of Object.entries(manifest)) {
		const cachedHash = await getResponseHash(pathname);
		if (hash != cachedHash) {
			console.log("invalidating", pathname);
			//console.log(hash, cachedHash);
			res.push(pathname);
		}
	}

	return res;
}

async function init(
	source: Client | ServiceWorker | MessagePort | null,
	manifest: Manifest,
	lang: Locale,
) {
	if (initializing) return;
	initializing = true;

	const cache = await getCache();
	const pathnames = await invalidFiles(manifest);

	if (pathnames.length > 0) {
		source?.postMessage({ type: "initAppCache", pathnames });
	}

	await Promise.all(pathnames.map((pathname) => {
		source?.postMessage({ type: "initAppCacheProgress", pathname });
		return cache.add(pathname);
	}));
	await setManifest(manifest);

	// 2. Update Bible resources.
}

export type Message =
	| { type: "skipWaiting" }
	| { type: "init"; manifest: Manifest; lang: Locale }
	| { type: "add"; publication: Publication };

self.addEventListener("message", (ev) => {
	const msg = ev.data as Message;
	switch (msg.type) {
		case "skipWaiting":
			console.log("skipWaiting", cacheId);
			self.skipWaiting();
			break;
		case "init":
			init(ev.source, msg.manifest, msg.lang);
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
