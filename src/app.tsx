import type { Publication } from "@openbible/core";
import { render } from "preact";
//import { Router, Route, RouteSectionProps } from '@solidjs/router';
//import { Home } from './pages/home';
//import { NotFound } from './pages/404';
//import { Context, values } from './settings/values';
import sources from "./sources.ts";
import i18n, { lang } from "./i18n.ts";
import "./app.css";
import MyWorker from "./workers/service.ts?sharedworker&url";

const defaultPub = Object.values(sources).find((v) => v.lang == lang.value) ??
	sources.bsb;

let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
	console.log('controllerchange');
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

try {
	const registration = await navigator.serviceWorker.register(MyWorker, {
		type: "module",
		scope: "/",
	});
	await navigator.serviceWorker.ready;
	if (!registration.active) throw Error('Failed installing service worker');

	const links = [...document.head.querySelectorAll('link[href]')].map(e => (e as HTMLLinkElement).href);
	const scripts = [...document.head.querySelectorAll('script[src]')].map(e => (e as HTMLScriptElement).src);
	registration.active.postMessage({ type: "cache", hrefs: links.concat(scripts) });
} catch (error) {
	console.error(`Registration failed with ${error}!`);
}

function Main() {
	//run({
	//	name: `${i18n.value.downloading} ${defaultPub.title}`,
	//	async worker() {
	//		const url = `${defaultPub.url}/all`;
	//		console.log('fetching', url);
	//		const resp = await fetch(url);
	//		const html = await resp.text();
	//		console.log('parsing');
	//		const parser = new DOMParser();
	//		window.parsed = parser.parseFromString(html, 'text/html');
	//		console.log(window.parsed);
	//	},
	//});
	return (
		<div>hello</div>
		//<Context.Provider value={values()}>
		//	<Router root={Root}>
		//		<Route component={Home} path="/" />
		//		<Route component={NotFound} path="*" />
		//	</Router>
		//</Context.Provider>
	);
}

function Root(props: RouteSectionProps<unknown>) {
	return (
		<main>
			{props.children}
		</main>
	);
}

render(<Main />, document.body);
