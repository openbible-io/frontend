import { render } from "preact";
import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { Provider as StoreProvider, useCreateStore } from "./stores/client.ts";
import Loading from "./pages/loading.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import sharedInit from "./stores/shared.ts";
import { getLang } from "./i18n.ts";
import { Context as ServiceWorker, initService } from "./workers.ts";
import { useEffect, useState } from "preact/hooks";
import publications from "./publications.ts";
import "./app.css";

// Handle new service worker installation.
// We store all view state in the service worker, so it's safe to refresh.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	console.log("controllerchange");
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function App() {
	const shared = useCreateStore(() =>
		sharedInit().setValues({ lang: getLang() })
	);
	const [worker, setWorker] = useState<ServiceWorker>();

	useEffect(() => {
		initService().then((w) => {
			if (import.meta.env.DEV) console.log(w);
			setWorker(w);

			const lang = shared.getValue("lang");
			const [id, pub] = Object.entries(publications).find(([_, v]) =>
				v.lang == lang
			) ?? ["bsb", publications.bsb];
			w.postMessage({ type: "add", pub });

			//history.replaceState(null, '', `/${id}/${Object.keys(pub.toc)[0]}`);
		});
	}, []);

	return (
		<ServiceWorker.Provider value={worker}>
			<StoreProvider storesById={{ shared }}>
				<LocationProvider>
					<ErrorBoundary>
						<Router>
							<Route path="/" component={Loading} />
							<Route path="/:pub/:book" component={Reader} />
							<Route default component={NotFound} />
						</Router>
					</ErrorBoundary>
				</LocationProvider>
			</StoreProvider>
		</ServiceWorker.Provider>
	);
}

render(<App />, document.body);
