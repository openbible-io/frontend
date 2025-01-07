import hashFn from "../shared/hash.ts";
import { servicePath } from "../shared/workers.ts";
import {
	addNotification,
	setNotification,
} from "./components/notifications-drawer.tsx";

declare global {
	interface Window {
		MANIFEST: { [key: string]: string };
	}
}

export async function initService(): Promise<ServiceWorker | undefined> {
	if (!("serviceWorker" in navigator)) {
		addNotification({
			icon: "icon-[lucide--message-circle-warning]",
			title: "Service workers unavailable",
			body: "Will not work offline",
		});
		return;
	}
	// Warning: The service worker lifecycle API is a mess.
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

	// Fetch and install latest version. Does NOT pass through service worker
	// fetch handler.
	await reg.update();

	// If an update occured and a previous version is installed, it will now be
	// "installing" and then "waiting" to be "activated" once the old version
	// is unloaded.
	const newSw = reg.installing;

	if (newSw) {
		// Just unload the old version and lose its state.
		newSw.postMessage({ type: "skipWaiting" });
		res = await new Promise((resolve) => {
			newSw.addEventListener("statechange", () => {
				if (newSw.state == "installed") resolve(newSw);
			});
		});
	}

	navigator.serviceWorker.addEventListener("message", (ev) => {
		if (ev.data.type == "cacheNew" && ev.data.count > 0) {
			addNotification({
				icon: "icon-[lucide--download]",
				title: "Available offline",
				body: `Cached ${ev.data.count} new assets.`,
			});
		}
	});

	// deno-lint-ignore no-window
	const manifest = window.MANIFEST;
	delete manifest[servicePath];
	// No easy way around this because of differences in .outerHTML impls :(
	// Hopefully, it's cached locally!
	const doc = await fetch(".");
	manifest["/"] = await hashFn(await doc.arrayBuffer());

	res.postMessage({ type: "cache", manifest });

	return res;
}
