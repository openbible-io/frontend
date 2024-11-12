import { useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from "preact";
import Header from "../../components/header.tsx";
import { Context as ServiceWorker, initService } from "../../workers/workers.ts";
import Tasks from "../../components/tasks.tsx";

interface LayoutProps {
	provideWorker?: boolean;
	children?: ComponentChildren;
}
export default function Layout({ provideWorker = true, children }: LayoutProps) {
	const [worker, setWorker] = useState<ServiceWorker | null>(navigator.serviceWorker.controller);

	useEffect(() => {
		initService().then((w) => {
			//if (import.meta.env.DEV) console.log(w);
			setWorker(w);
		});
	}, []);

	const Inner = () => (
		<>
			<Header />
			{children}
		</>
	);

	if (!provideWorker) return <Inner />;

	return provideWorker ? (
		<ServiceWorker.Provider value={worker}>
			<Inner />
		</ServiceWorker.Provider>
	) :
		<Tasks />;
}
