import classnames from "../lib/classnames.ts";
import Button from "./button.tsx";
import Settings from "./settings.tsx";
import * as store from "../stores/client.ts";
import { useStore } from "@nanostores/preact";
import { useEffect, useRef, useState } from "preact/hooks";
//import resolveConfig from 'tailwindcss/resolveConfig';
//
//const fullConfig = resolveConfig({ content: [] });
//const breakpoints = (Object.entries(fullConfig.theme.screens)
//	.map(([k, v]) => [k, parseInt(v)]) as [string, number][])
//	.sort(([_, v1], [__, v2]) => v2 - v1);
//
//function getCurrentBreakpoints() {
//    return breakpoints.find(([_, v]) => globalThis.innerWidth > v)?.[0];
//}

export const i18n = store.i18n("header", {
	settings: "Settings",
});

export default function Header(props: { class?: string }) {
	const ref = useRef<HTMLElement>(null);
	const t9n = useStore(i18n);
	const [height, setHeight] = useState("0");

	useEffect(() => {
		setHeight(getComputedStyle(ref.current!).height);
	}, []);

	return (
		<header
			ref={ref}
			class={`grid grid-cols-6 w-full p-2 ${props.class}`}
			style={`--height-header:${height}`}
		>
			<div
				class={classnames(
					"col-start-2 col-span-4",
					"w-full m-1 rounded-lg p-1 drop-shadow-lg",
					"bg-bg bg-mix-text bg-mix-amount-10 hover:bg-mix-amount-20",
					"flex items-center",
				)}
			>
				<div class="icon icon-[lucide--search] text-xs mx-2" />
				<input class="ml-1 flex-1 bg-transparent outline-none" />
			</div>

			<div class="ltr:text-right rtl:text-left">
				<Button popovertarget="drawer">
					<div class="icon icon-[lucide--settings]" />
				</Button>
			</div>

			<div
				id="drawer"
				popover
				class={classnames(
					"m-0 p-2 w-screen md:w-96",
					"[--top:50vh] md:[--top:var(--height-header)]",
					"absolute ltr:left-auto ltr:right-0 rtl:right-auto rtl:left-0",
				)}
			>
				<h1>{t9n.settings}</h1>
				<Settings />
			</div>
		</header>
	);
}
