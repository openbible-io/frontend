import { createContext } from "preact";

declare global {
	interface Window {
		MANIFEST: string;
	}
}

export async function initService() {
	const registration = await navigator.serviceWorker.register(
		"/service.js",
		{
			type: "module",
			scope: "/",
		},
	);
	await navigator.serviceWorker.ready;
	if (!registration.active) throw Error("Failed installing service worker");

	const hrefs: string[] = ["/"];
	console.log(window.MANIFEST);
	registration.active.postMessage({ type: "cache", hrefs });

	return registration.active;
}

export const Context = createContext<ServiceWorker | undefined>(
	navigator.serviceWorker.controller!,
);
