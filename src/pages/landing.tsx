import publicationzzzz from "../../shared/publications.ts";
import Redirect from "../components/redirect.tsx";
import { useValue, useTable } from '../stores/client.ts';

export default function Landing() {
	const lang = useValue("lang");
	const publications = useTable("publication");
	console.log("landing", lang, publications);
	const [id, pub] =
		Object.entries(publicationzzzz).find(([_, v]) => v.lang == lang) ??
			["bsb", publicationzzzz.bsb];

	return <Redirect to={`/${id}/${Object.keys(pub.toc)[0]}`} replace={true} />;
}
