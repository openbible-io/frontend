import Editor from "../components/editor/editor.tsx";

export interface Props {
	pub: string;
	book: string;
};
export default function Reader(props: Props) {
	// TODO: redirect to download page if not downloaded
	console.log("fetch + make doc model", props);

	return (
		<Editor toolbar />
	);
}
