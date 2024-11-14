import type { ComponentChildren } from "preact";
import Header from "../../components/header.tsx";

interface LayoutProps {
	children?: ComponentChildren;
}
export default ({ children }: LayoutProps) => (
	<>
		<Header />
		{children}
	</>
);
