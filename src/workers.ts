import { createContext } from "preact";
import hash from "../shared/hash.ts";

declare global {
	interface Window {
		MANIFEST: { [key: string]: string };
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

	// deno-lint-ignore no-window
	const manifest = window.MANIFEST;
	manifest["/"] = await hash(document.documentElement.outerHTML);
	console.log(manifest);
	registration.active.postMessage({ type: "cache", manifest });

	return registration.active;
}

export const Context = createContext<ServiceWorker | undefined>(
	navigator.serviceWorker.controller!,
);
