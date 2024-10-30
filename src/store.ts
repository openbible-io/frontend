import { createBroadcastChannelSynchronizer } from "tinybase/synchronizers/synchronizer-broadcast-channel";
import { getLang } from "./i18n.ts";
import { createMergeableStore } from "tinybase";
import serviceWorkerUrl from "./workers/service.ts?worker&url";
import publications from "./publications.ts";

const lang = getLang();
/** Non-document state. */
const store = createMergeableStore()
	.setValues({
		lang,
	})
	.setTablesSchema({
		workerTask: {
			name: { type: "string" },
		},
		author: {
			url: { type: "string" },
			name: { type: "string" },
			qualifications: { type: "string" },
			contributions: { type: "string" },
		},
		toc: {
			id: { type: "string" },
			title: { type: "string" },
			nChapters: { type: "number" },
		},
		audio: {
			publication: { type: "string" },
			downloadUrl: { type: "string" },
			license: { type: "string" },
			licenseUrl: { type: "string" },
			publisher: { type: "string" },
			publisherUrl: { type: "string" },
			publishDate: { type: "string" },
			runtime: { type: "number" },
			size: { type: "number" },
		},
		audio_author: {
			audio: { type: "string" },
			author: { type: "string" },
		},
		publication: {
			id: { type: "string" },
			title: { type: "string" },
			lang: { type: "string" },
			downloadUrl: { type: "string" },
			publisher: { type: "string" },
			publisherUrl: { type: "string" },
			publishDate: { type: "string" },
			isbn: { type: "number" },
			license: { type: "string" },
			licenseUrl: { type: "string" },
			toc: { type: "string" },
			size: { type: "number" },
		},
		publication_author: {
			publication: { type: "string" },
			author: { type: "string" },
		},
	});
export default store;

addEventListener("languagechange", () => {
	store.setValues({ lang: getLang() });
});

export let worker: ServiceWorker;

async function registerWorker() {
	const installed = Boolean(navigator.serviceWorker.controller);
	store.setValue("verb", installed ? "loading" : "downloading");
	store.setValue("object", "service worker");
	const registration = await navigator.serviceWorker.register(
		serviceWorkerUrl,
		{
			type: "module",
			scope: "/",
		},
	);
	await navigator.serviceWorker.ready;
	if (!registration.active) throw Error("Failed installing service worker");

	const links = [...document.head.querySelectorAll("link[href]")].map((e) =>
		(e as HTMLLinkElement).href
	);
	const scripts = [...document.head.querySelectorAll("script[src]")].map((e) =>
		(e as HTMLScriptElement).src
	);
	registration.active.postMessage({
		type: "cache",
		hrefs: links.concat(scripts),
	});

	//const lang = store.getValue('lang');
	//const pub = Object.values(publications).find((v) => v.lang == lang) ?? publications.bsb;
	registration.active.postMessage({ type: "add", pub: publications.bsb });

	return registration.active;
}

export async function init() {
	// Block on this so we can get updates from `registerWorker`.
	await createBroadcastChannelSynchronizer(store, "store").startSync();
	worker = await registerWorker();
	if (import.meta.env.DEV) console.log(worker);
}
