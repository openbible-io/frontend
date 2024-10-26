declare const self: ServiceWorkerGlobalScope;

const cacheId = 'v1';

// Run for very first time
// Persistent DB init
self.addEventListener("install", ev => {
	console.log("install");
	// The promise that skipWaiting() returns can be safely ignored.
  self.skipWaiting();
	ev.waitUntil(
		caches.open(cacheId).then(cache => cache.add('/'))
	);
});

// All pages controlled by old version are gone
// Delete old version persistent DB
self.addEventListener("activate", ev => {
	console.log('activate');
  ev.waitUntil(
    caches.keys().then(keyList => Promise.all(keyList.map(key => {
      if (key !== cacheId) {
				console.log('delete cache', cacheId);
				return caches.delete(key);
			}
    })))
  );
});

async function cacheNew(urls: RequestInfo[]) {
	const c = await caches.open(cacheId);
	const uncached: RequestInfo[] = [];
	for (const u of urls) {
		if (!await c.match(u)) uncached.push(u);
	}
	return c.addAll(uncached);
}

self.addEventListener("message", ev => {
	console.log("msg", ev.data);
	switch (ev.data.type) {
		case 'cache':
			// The browser doesn't trust "cache forever" headers when offline.
			ev.waitUntil(cacheNew(ev.data.hrefs));
			break;
		default:
			throw Error('Handle message ' + ev.data.type);
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
	throw Error('Network offline and uncached: ' + request.url);
}

const cacheForeverRe = new RegExp(import.meta.env.OPENBIBLE_CACHE_FOREVER_REGEX);

self.addEventListener("fetch", ev => {
  ev.respondWith(ev.request.url.match(cacheForeverRe)
		? cacheThenNetwork(ev.request)
		: networkThenCache(ev.request));
});

export default "";
