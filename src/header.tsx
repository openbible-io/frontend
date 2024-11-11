import Dropdown from "./dropdown.tsx";

export default function Header() {

	return (
		<header
			class="grid justify-items-center w-screen"
			style="grid-template-columns: 1fr 85% 1fr"
		>
			<div />
			<input style="width:100%" />
			<div >
				<Dropdown button="S">
					settings
				</Dropdown>
			</div>
		</header>
	);
}
