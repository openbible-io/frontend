import classnames from "../lib/classnames.ts";
import Button, { CloseButton } from "./button.tsx";
import Settings from "./settings.tsx";
import * as store from "../stores/client.ts";
import { useStore } from "@nanostores/preact";
import { useRef } from "preact/hooks";
import Input from "./input.tsx";
import Drawer from "./drawer.tsx";

export const i18n = store.i18n("header", {
	settings: "Settings",
	home: "Home",
});

export default function Header() {
	const ref = useRef<HTMLDivElement>(null);
	const t9n = useStore(i18n);

	return (
		<header class="flex align-center justify-between gap-2 w-full p-2">
			<div class="ltr:text-right rtl:text-left">
				<Button popovertarget="settingsDrawer" class="m-2">
					<div class="icon icon-[lucide--settings]" />
				</Button>
			</div>
			<div
				class={classnames(
					"w-[36rem] rounded-lg",
					"bg-bg/10",
					"flex items-center",
					"drop-shadow-sm focus-within:drop-shadow-2xl hover:drop-shadow-2xl",
				)}
				onClick={(ev) => ev.currentTarget.querySelector("input")?.focus()}
			>
				<div class="icon icon-[lucide--search] text-xs mx-2" />
				<Input
					name="search"
					autocomplete="off"
					class="flex-1 bg-transparent border-none focus:ring-0 p-0"
				/>
			</div>
			<div />

			<Drawer
				ref={ref}
				position="left"
				id="settingsDrawer"
				class={classnames(
					"drawer-animate drawer-backdrop",
					"bg-bg bg-mix-text bg-mix-amount-20",
				)}
			>
				<div class="pb-4 flex justify-between">
					<h1 class="text-2xl">{t9n.settings}</h1>
					<CloseButton onClick={() => ref.current?.hidePopover()} />
				</div>
				<div class="flex-grow overflow-auto">
					<Settings />
				</div>
			</Drawer>
		</header>
	);
}
