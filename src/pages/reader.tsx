import { useRoute } from "preact-iso";
import Layout from "./layouts/header.tsx";
import Editor from "../components/editor/editor.tsx";

export default function ReaderPage() {
	const props = useRoute();
	// TODO: redirect to download page if not downloaded
	console.log("fetch + make doc model", props);

	return (
		<Layout>
			<Editor toolbar />
		</Layout>
	);
}
