import { render } from 'solid-js/web';
import { Router, Route, RouteSectionProps } from '@solidjs/router';
import { Home } from './pages/home';
import { NotFound } from './pages/404';
import { Context, values } from './settings/values';
import './main.css';

function Main() {
	return (
		<Context.Provider value={values()}>
			<Router root={Root}>
				<Route component={Home} path="/" />
				<Route component={NotFound} path="*" />
			</Router>
		</Context.Provider>
	);
}

function Root(props: RouteSectionProps<unknown>) {
	return (
		<main>
			{props.children}
		</main>
	);
}

render(Main, document.body);
