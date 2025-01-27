// TLDR: The service worker lifecycle API is a mess.
//
// Service workers cannot intercept requests until they're installed.
// We don't want to send requests twice (once on first load, and once for the
// service worker to intercept and cache) because then we rely on the browser's
// caching behavior which relies on the server sending a `cache-control` header
// with max-age > 0.
//
// We cannot reliably  predict how long the browser will take to install the
// service worker. Instead, let's avoid requesting anything but the service
// worker and a favicon until the worker is installed.
//
// This is tolerable because the service worker is also the single source of
// truth for storing user content and we want the app to work *offline* as fast
// as possible rather than work *online* as fast as possible.
import type { JSX } from "preact";
import { servicePath } from "../shared/workers.ts";

export type SSR = {
	noworker: string;
	entrypoints: string[];
	rest: string[];
	webmanifest?: string;
	lang: string;
};

declare global {
	interface Window {
		SSR: SSR;
	}
}

const { SSR } = window;

function addScript(
	url?: string,
	extra?: JSX.ScriptHTMLAttributes<HTMLScriptElement>,
) {
	if (!url) return;

	const ele = document.createElement("script");
	ele.src = url;
	ele.type = "module";
	Object.assign(ele, extra);
	document.head.append(ele);
}

function addLink(
	href?: string,
	extra?: JSX.LinkHTMLAttributes<HTMLLinkElement>,
) {
	if (!href) return;

	const ele = document.createElement("link");
	ele.href = href;
	Object.assign(ele, extra);
	document.head.append(ele);
}

// Given online, set navigator.serviceWorker.controller to latest
async function bootstrap() {
	const app = document.getElementById("app")!;

	if (!("serviceWorker" in navigator)) {
		const error = SSR.noworker;
		app.innerText = error;
		throw new Error(error);
	}

	// Load previously installed worker or fetch and install first one.
	const reg = await navigator.serviceWorker.register(
		servicePath,
		{
			type: "module",
			scope: "/",
			// Do not use HTTP cache for service worker. Do use it for deps which
			// have [hash] in their names.
			updateViaCache: "imports",
		},
	);

	// Fetch and install latest version. Does NOT pass through service worker's
	// fetch handler.
	await reg.update();
	// If an update occured and a previous version is installed, the new version
	// will be "installing" and then "waiting" to be "activated" once the old
	// version is unloaded.
	const updatedSw = reg.installing;

	if (updatedSw) {
		// Unload the old version and lose its state.
		updatedSw.postMessage({ type: "skipWaiting" });
		await new Promise((resolve) => {
			updatedSw.addEventListener("statechange", () => {
				if (updatedSw.state == "installed") {
					console.log("sw updated existing");
					resolve(updatedSw);
				}
			});
		});
	} else if (!navigator.serviceWorker.controller) {
		console.log("sw freshly installed");
	}

	// Now let's load our app in.
	await navigator.serviceWorker.ready;
	if (!navigator.serviceWorker.controller) {
		// If you force-reload the page (shift-reload) it bypasses the service
		// worker's `fetch` handler. We will kindly refuse this behavior so that
		// the service worker can intercept fetch requests and have the app
		// run like normal.
		reg.active?.postMessage({ type: "claimMe" });
		await new Promise(res => navigator.serviceWorker.addEventListener("controllerchange", res));
	}

	if (!navigator.serviceWorker.controller) {
		console.error("awkward");
		const error = SSR.noworker;
		app.innerText = error;
		throw new Error(error);
	}

	SSR.entrypoints.forEach((e) => {
		if (e.includes("bootstrap") || e.includes("service")) return;
		if (e.endsWith(".js")) addScript(e);
		else addLink(e, { rel: "stylesheet" });
	});

	// Prefetch for faster first load.
	SSR.rest.forEach((e) => {
		if (e.endsWith(".woff2")) {
			// TODO: prefetch instead of preload fonts not used in props.lang
			addLink(e, {
				rel: "preload",
				type: "font/woff2",
				as: "font",
				crossOrigin: "anonymous",
			});
		} else if (e.endsWith(".js")) {
			const isNonNativeI18n = e.includes("i18n") &&
				!e.includes(SSR.lang);
			addLink(e, {
				rel: isNonNativeI18n ? "prefetch" : "modulepreload",
				as: "script",
			});
		}
	});
	addLink(SSR.webmanifest, { rel: "manifest" });
}

bootstrap();
