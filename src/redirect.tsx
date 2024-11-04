import { useLocation } from "preact-iso";

interface RedirectProps {
	to: string;
	replace?: boolean;
};
export default function Redirect(props: RedirectProps) {
	const { route } = useLocation();

	route(props.to, props.replace);

	return <a href={props.to}>{props.to}</a>;
}
