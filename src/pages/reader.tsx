import Editor from "../editor.tsx";

interface ReaderPageProps {
	pub: string;
	book: string;
}

export default function ReaderPage(props: ReaderPageProps) {
	console.log("make doc model + fetch", props);

	return <Editor toolbar />;
}
