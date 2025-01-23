import hashFn from "../shared/hash.ts";
import { servicePath } from "../shared/workers.ts";
import {
	addNotification,
	setNotification,
} from "./components/notifications-drawer.tsx";
import { lang } from "./stores/client.ts";
import { Message } from "./workers/service.ts";

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
	const updatedSw = reg.installing;

	if (updatedSw) {
		// Just unload the old version and lose its state.
		updatedSw.postMessage({ type: "skipWaiting" });
		res = await new Promise((resolve) => {
			updatedSw.addEventListener("statechange", () => {
				if (updatedSw.state == "installed") resolve(updatedSw);
			});
		});
		// Wait for it to be "active".
		await navigator.serviceWorker.ready;
	}

	// Show a nice notification with progress as the service worker installs
	// itself and Bible resources.
	//navigator.serviceWorker.addEventListener("message", ev => {
	//	console.log(2, "got msg from sw", ev.data);
	//	if (ev.data.type == "initApp")
	//});
	const toCache = [...document.head.children]
		.reduce((acc, cur) => {
			if (cur.tagName == "SCRIPT") acc.push((cur as HTMLScriptElement).src);
			else if (cur.tagName == "LINK") {
				const href = (cur as HTMLLinkElement).href;
				if (href != servicePath) acc.push(href);
			}

			return acc;
		}, ["/"]);

	res.postMessage({ type: "init", toCache, lang: lang.get() } as Message);

	return res;
}

//[...new Intl.Segmenter('en', { granularity: 'word' }).segment('In the beginning God created the heaven and the earth.')]
//[...new Intl.Segmenter('he', { granularity: 'sentence' }).segment('בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ. וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־פְּנֵ֥י הַמָּֽיִם.')]
//
