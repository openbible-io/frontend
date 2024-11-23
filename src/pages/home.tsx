import { params } from "@nanostores/i18n";
import { render } from "preact";
import * as store from "../stores/client.ts";
import { useStore } from "@nanostores/preact";
import { addNotification } from "../components/notifications-drawer.tsx";
//import { LoroDoc, LoroList } from "loro-crdt";

export const i18n = store.i18n("home", {
	welcome: params("Welcome home, {username}!"),
});
//const [id, pub] =
//	Object.entries(publications).find(([_, v]) => v.lang == lang) ??
//		["bsb", publications.bsb];
export default function Home() {
	const username = useStore(store.username);
	const t9n = useStore(i18n);
	//const doc = new LoroDoc();
	//const listA: LoroList = doc.getList("list");
	//listA.insert(0, "A");
	//console.log(doc.toJSON());

	return (
		<>
			<h1 class="text-center text-2xl">
				{t9n.welcome({ username })}
			</h1>
			<button onClick={addNotification}>
				Toast
			</button>
		</>
	);
}
