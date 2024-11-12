import { render } from "preact";
import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { Provider as StoreProvider, useCreateStore } from "./stores/client.ts";
import Landing from "./pages/landing.tsx";
import About from "./pages/about.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import sharedInit from "./stores/shared.ts";
import { useEffect, useState } from "preact/hooks";
import { Context as ServiceWorker, initService } from "./workers.ts";
import { useLang } from "./i18n.ts";
import './favicon.svg';
import './app.css';

// Handle new service worker installation.
// We store all view state in the service worker, so it's safe to refresh.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function App() {
	const lang = useLang();
	const shared = useCreateStore(() => sharedInit().setValues({ lang }));
	const [worker, setWorker] = useState<ServiceWorker>();
	useEffect(() => {
		initService().then((w) => {
			if (import.meta.env.DEV) console.log(w);
			setWorker(w);
		});

		shared.addValueListener("lang", (_, __, newValue) => {
			console.log("lang change", arguments);
			localStorage.setItem("lang", newValue);
		});
	}, []);

	return (
		<StoreProvider storesById={{ shared }}>
			<ServiceWorker.Provider value={worker}>
				<LocationProvider>
					<ErrorBoundary>
						<Router>
							<Route path="/" component={Landing} />
							<Route path="/about" component={About} />
							<Route path="/:pub/:book" component={Reader} />
							<Route default component={NotFound} />
						</Router>
					</ErrorBoundary>
				</LocationProvider>
			</ServiceWorker.Provider>
		</StoreProvider>
	);
}

render(<App />, document.getElementById("app")!);
