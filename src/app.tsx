import type { Publication } from '@openbible/core';
import { render } from 'preact';
import {createStore} from 'tinybase';
//import { Router, Route, RouteSectionProps } from '@solidjs/router';
//import { Home } from './pages/home';
//import { NotFound } from './pages/404';
//import { Context, values } from './settings/values';
import sources from './sources.ts';
import i18n, { lang } from './i18n.ts';
import './app.css';

const store = createStore();
window.store = store;
store.setTablesSchema({
});

const defaultPub = Object.values(sources).find(v => v.lang == lang) ?? sources.bsb;

type Task = {
	name: string,
	worker(): Promise<void>,
	state?: 'waiting' | 'running' | 'completed' | Error,
	deps?: Task[],
};

async function run(task: Task) {
	console.log(task.name);
	task.state = 'running';
	try {
		await task.worker();
	} catch (e) {
		console.error(e);
		task.state = e;
		return;
	}
	task.state = 'completed';
	(task.deps ?? []).forEach(run);
}

function Main() {
	run({
		name: `${i18n.value.downloading} ${defaultPub.title}`,
		async worker() {
			const url = `${defaultPub.url}/all`;
			console.log('fetching', url);
			const resp = await fetch(url);
			const html = await resp.text();
			console.log('parsing');
			const parser = new DOMParser();
			window.parsed = parser.parseFromString(html, 'text/html');
			console.log(window.parsed);
		},
	});
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
