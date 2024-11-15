import { render } from "preact";
import { useStore } from "@nanostores/preact";
import { lang, type Theme, theme, themes } from "./stores/client.ts";
import Landing from "./pages/landing.tsx";
import About from "./pages/about.tsx";
import NotFound from "./pages/404.tsx";
import Reader from "./pages/reader.tsx";
import Tasks from "./components/tasks.tsx";
import "./app.css";
import langs, { Language } from "../shared/i18n.ts";

// Handle new service worker installation.
// We store most view state so it's safe to refresh
// when we get a new worker.
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
	if (refreshing) return;
	refreshing = true;
	location.reload();
});

function App() {
	const t = useStore(theme);
	const l = useStore(lang);

	return (
		<div>
			<select
				onChange={(ev) => theme.set(ev.currentTarget.value as Theme)}
				value={t}
			>
				{themes.map((t) => <option>{t}</option>)}
			</select>
			<select
				onChange={(ev) => lang.set(ev.currentTarget.value as Language)}
				value={l}
			>
				{Object.keys(langs).map((t) => <option>{t}</option>)}
			</select>
		</div>
	);
	//if (!worker) return <Tasks />;
	//return (
	//	<LocationProvider>
	//		<Router>
	//			<Route path="/" component={Landing} />
	//			<Route path="/about" component={About} />
	//			<Route path="/:pub/:book" component={Reader} />
	//			<Route default component={NotFound} />
	//		</Router>
	//	</LocationProvider>
	//);
}

render(<App />, document.getElementById("app")!);
