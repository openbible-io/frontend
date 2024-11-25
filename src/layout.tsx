import type { ComponentChildren } from "preact";
import Header from "./components/header.tsx";
import { useStore } from "@nanostores/preact";
import * as store from "./stores/client.ts";
import classnames from "./lib/classnames.ts";
import NotificationsDrawer from "./components/notifications-drawer.tsx";

interface LayoutProps {
	children?: ComponentChildren;
}
export default function Layout({ children }: LayoutProps) {
	const theme = useStore(store.theme);

	return (
		<div
			class={classnames(
				"w-screen h-screen bg-bg text-text",
				"flex flex-col",
				"transition-colors duration-700 ease-out",
				theme,
			)}
		>
			<Header />
			<div class="grow-1 min-h-0 overflow-x-auto p-2">
				{children}
			</div>
			<NotificationsDrawer />
		</div>
	);
}
