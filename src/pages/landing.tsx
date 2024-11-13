import Redirect from "../components/redirect.tsx";
import store, { useValue, useTable } from '../stores/client.ts';
import publications from '../../shared/publications.ts';

export default function Landing() {
	const lang = useValue("lang");
	// TODO: redirect to most recently closed tab

	// This only happens on VERY first load before workspace is saved.
	const [id, pub] = Object.entries(publications).find(([_, v]) => v.lang == lang) ??
			["bsb", publications.bsb];

	return <Redirect to={`/${id}/${Object.keys(pub.toc)[0]}`} replace={true} />;
}
