import Dropdown from "./dropdown.tsx";

export default function Header() {
	return (
		<header>
			<div style={{ float: "right" }}>
				<Dropdown button="settings">
					settings
				</Dropdown>
			</div>
		</header>
	);
}
