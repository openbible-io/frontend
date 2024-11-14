import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import Landing from "./pages/landing.tsx";
import About from "./pages/about.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import "./app.css";

// Handle new service worker installation.
// We store all view state in the service worker, so it's safe to refresh.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

const App = () => (
	<LocationProvider>
		<Router>
			<Route path="/" component={Landing} />
			<Route path="/about" component={About} />
			<Route path="/:pub/:book" component={Reader} />
			<Route default component={NotFound} />
		</Router>
	</LocationProvider>
);

render(<App />, document.getElementById("app")!);
