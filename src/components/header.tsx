import classnames from "../lib/classnames.ts";
import Button from "./button.tsx";
import Settings from "./settings.tsx";
import * as store from "../stores/client.ts";
import { useStore } from "@nanostores/preact";

export const i18n = store.i18n("header", {
	settings: "Settings",
});

export default function Header(props: { class?: string }) {
	const t9n = useStore(i18n);

	return (
		<header class={`grid grid-cols-6 w-full p-2 ${props.class}`}>
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
				onBeforeToggle={(ev: ToggleEvent) => {
					const t = ev.target as HTMLDivElement;
					console.log(ev.target);
					t.style.setProperty(
						"--top",
						t.parentElement!.getBoundingClientRect().bottom + "px",
					);
				}}
				class={classnames(
					"m-0 p-2 w-1/3",
					"absolute ltr:left-auto ltr:right-0 rtl:right-auto rtl:left-0",
				)}
			>
				<h1>{t9n.settings}</h1>
				<Settings />
			</div>
		</header>
	);
}
