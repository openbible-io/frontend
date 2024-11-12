import { useDict } from "../lib/i18n.ts";
import Layout from './layouts/header.tsx';

export default function NotFound() {
	const dict = useDict();

	return (
		<Layout worker={false}>
			<h1>404 - {dict["404"]}</h1>
		</Layout>
	);
}
