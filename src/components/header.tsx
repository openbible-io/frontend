import Dropdown from "./dropdown.tsx";

export default function Header() {
	return (
		<header class="grid grid-cols-6 w-full">
			<input class="col-start-2 col-span-4 w-full" />
			<Dropdown
				class="text-right"
				button={{
					children: "Settings",
				}}
			>
				settings
			</Dropdown>
		</header>
	);
}
