import Settings from "./settings.tsx";
import Dropdown from "./dropdown.tsx";
import classnames from "../lib/classnames.ts";

export default function Header() {
	return (
		<header class="grid grid-cols-6 w-full p-2">
			<div
				class={classnames(
					"flex items-center col-start-2 col-span-4 w-full m-1 rounded-lg p-1",
					"drop-shadow-lg",
					"bg-bg bg-mix-text bg-mix-amount-10 hover:bg-mix-amount-20",
				)}
			>
				<div class="icon icon-[lucide--search] text-xs mx-2" />
				<input class="ml-1 flex-1 bg-transparent outline-none" />
			</div>
			<Dropdown
				class="text-right"
				button={{
					children: <div class="icon icon-[lucide--settings]" />,
				}}
			>
				<Settings />
			</Dropdown>
		</header>
	);
}
