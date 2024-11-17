import { render } from "preact";
import { useStore } from "@nanostores/preact";
import * as store from "./stores/client.ts";
//import Landing from "./pages/landing.tsx";
//import About from "./pages/about.tsx";
//import NotFound from "./pages/404.tsx";
//import Reader from "./pages/reader.tsx";
//import Tasks from "./components/tasks.tsx";
import classnames from "./lib/classnames.ts";
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
	const theme = useStore(store.theme);
	const lang = useStore(store.lang);
	const systemLang = useStore(store.systemTheme);

	return (
		<div class={classnames("w-screen h-screen bg-bg text-text", theme == "system" ? systemLang : theme)}>
			<select
				class="bg-inherit"
				onChange={(ev) => store.theme.set(ev.currentTarget.value as store.Theme)}
				value={theme}
			>
				{store.themes.map((t) => <option>{t}</option>)}
			</select>
			<select
				class="bg-inherit"
				onChange={(ev) => store.lang.set(ev.currentTarget.value as Language)}
				value={lang}
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
