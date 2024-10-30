import { render } from "preact";
import { LocationProvider, ErrorBoundary, Router, Route } from 'preact-iso';
import Loading from './pages/loading.tsx';
import NotFound from './pages/404.tsx';
import Reader from './pages/reader.tsx';
import { init } from './store.ts';
import "./app.css";

// Handle new service worker installation.
// We store all view state in the service worker, so it's safe to refresh.
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
	console.log('controllerchange');
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function App() {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<Router>
					<Route path="/" component={Loading} />
					<Route path="/:pub/:book" component={Reader} />
					<Route default component={NotFound} />
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	);
}

// Render first to be responsive!
render(<App />, document.body);
// Then init service worker
init();
