import { useDict } from "../i18n.ts";

export default function NotFound() {
	const dict = useDict();

	return <h1>404 - {dict["404"]}</h1>;
}
