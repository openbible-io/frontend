import { createContext } from "preact";

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
	for (const link of document.head.querySelectorAll("link[href]")) {
		hrefs.push((link as HTMLLinkElement).href);
	}
	for (const script of document.head.querySelectorAll("script[src]")) {
		hrefs.push((script as HTMLScriptElement).src);
	}
	registration.active.postMessage({ type: "cache", hrefs });

	return registration.active;
}

export const Context = createContext<ServiceWorker | undefined>(
	navigator.serviceWorker.controller!,
);
