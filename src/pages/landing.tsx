import { useValue } from "../stores/client.ts";
import publications from '../publications.ts';
import Redirect from '../redirect.tsx';

export default function Landing() {
	const lang = useValue("lang", "shared");
	console.log('landing lang', lang);
	const [id, pub] = Object.entries(publications).find(([_, v]) =>
		v.lang == lang
	) ?? ["bsb", publications.bsb];

	return <Redirect to={`/${id}/${Object.keys(pub.toc)[0]}`} replace={true} />;
}
