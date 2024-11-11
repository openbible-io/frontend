import { useRoute } from "preact-iso";
import Editor from "../editor.tsx";
import Header from "../header.tsx";

export default function ReaderPage() {
	const props = useRoute();
	// TODO: redirect to download page if not downloaded
	console.log("fetch + make doc model", props);

	return (
		<>
			<Header />
			<Editor toolbar />
		</>
	);
}
