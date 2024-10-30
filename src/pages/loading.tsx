import i18n from "../i18n.ts";
import {useValue} from 'tinybase/ui-react';
import publications from "../publications.ts";
import kv from '../store.ts';

export default function Loading() {
	const lang = useValue('lang', kv);
	const verb = useValue('verb', kv);
	const object = useValue('object', kv);
	console.log({ lang, verb, object });

			//<div>{i18n.value[state.verb]} {i18n.value[state.object as '2letter'] ?? state.object}</div>
	return (
		<div>
			<pre>
				{JSON.stringify({ lang, verb, object })}
			</pre>
		</div>
	);
}
