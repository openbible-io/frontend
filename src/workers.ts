import { createContext } from "preact";
import { servicePath } from '../shared/workers.ts';

declare global {
	interface Window {
		MANIFEST: { [key: string]: string };
	}
}

export async function initService(): Promise<ServiceWorker> {
	// Warning: The service worker lifecycle API is a bit of  a mess.

	// Fetch and install service worker for first time OR
	// load cached one.
	const reg = await navigator.serviceWorker.register(
		servicePath,
		{
			type: "module",
			scope: "/",
			// Service worker takes care of all caching.
			updateViaCache: "none",
		},
	);
	// Wait for it to be "active".
	await navigator.serviceWorker.ready;
	let res = reg.active!;

	// Fetch and install latest version. This DOES pass through the service
	// worker's fetch handler if one has been previously installed.
	await reg.update();

	// If an update occured and a previous version is installed, it will now be
	// "installing" and then "waiting" to be "activated" once the old version
	// is unloaded.
	const newSw = reg.installing;
	if (newSw) {
		// Just unload the old version and lose its state.
		newSw.postMessage({ type: "skipWaiting" });
		res = await new Promise(resolve => {
			newSw.addEventListener("statechange", () => {
				if (newSw.state == "installed") resolve(newSw);
			});
		});
	}

	// deno-lint-ignore no-window
	const manifest = window.MANIFEST;
	delete manifest[servicePath];
	res.postMessage({ type: "cache", manifest });

	return res;
}

export const Context = createContext<ServiceWorker | undefined>(
	navigator.serviceWorker.controller!,
);
