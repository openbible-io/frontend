import { render } from "preact";
import { useEffect } from 'preact/hooks';
import { useStore } from "@nanostores/preact";
import * as store from "./stores/client.ts";
import Home from "./pages/home.tsx";
import About from "./pages/about.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import Layout from "./layout.tsx";
import { initService } from './workers.ts';
import "./app.css";

// Handle new service worker installation.
// We store most view state so refresh when we get a new worker.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function Router() {
	const page = useStore(store.router);

	switch (page?.route) {
		case "home":
			return <Home />;
		case "about":
			return <About />;
		//case "pub": return ;
		case "book":
			return <Reader {...page.params} />;
		default:
			return <NotFound />;
	}
}

function App() {
	//useEffect(() => {
	//	initService();
	//}, []);

	return (
		<Layout>
			<Router />
		</Layout>
	);
}

render(<App />, document.getElementById("app")!);
