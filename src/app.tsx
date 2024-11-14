import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { LocationProvider, Route, Router } from "preact-iso";
import Landing from "./pages/landing.tsx";
import About from "./pages/about.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import { Context as ServiceWorker, initService } from "./workers/workers.ts";
import Tasks from "./components/tasks.tsx";
import "./app.css";

// Handle new service worker installation.
// We store all view state in the service worker, so it's safe to refresh.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function App() {
	const [worker, setWorker] = useState<ServiceWorker | undefined>();

	useEffect(() => {
		initService().then((w) => {
			//if (import.meta.env.DEV) console.log(w);
			//setWorker(w);
		});
	}, []);

	if (!worker) return <Tasks />;

	return (
		<ServiceWorker.Provider value={worker}>
			<LocationProvider>
				<Router>
					<Route path="/" component={Landing} />
					<Route path="/about" component={About} />
					<Route path="/:pub/:book" component={Reader} />
					<Route default component={NotFound} />
				</Router>
			</LocationProvider>
		</ServiceWorker.Provider>
	);
}

render(<App />, document.getElementById("app")!);
