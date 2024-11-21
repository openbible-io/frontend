import { render } from "preact";
import { useStore } from "@nanostores/preact";
import * as store from "./stores/client.ts";
//import Landing from "./pages/landing.tsx";
import About from "./pages/about.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import Layout from "./layout.tsx";
//import Tasks from "./components/tasks.tsx";
import "./app.css";

// Handle new service worker installation.
// We store most view state so it's safe to refresh
// when we get a new worker.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function Router() {
	const page = useStore(store.router);

	switch (page?.route) {
		//case "home": return <HomePage />;
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
	return (
		<Layout>
			<Router />
		</Layout>
	);
}

render(<App />, document.getElementById("app")!);
