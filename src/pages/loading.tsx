import { useContext, useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { template, useDict } from "../i18n.ts";
import { Context as ServiceWorker } from "../workers.ts";
import { useStore } from "../stores/client.ts";
import publications, { type Publication } from "../publications.ts";

function defaultTask(worker?: ServiceWorker) {
	if (worker != undefined) return;
	const installed = Boolean(navigator.serviceWorker.controller);
	const id = "ui";
	return {
		[id]: {
			id,
			verb: `${installed ? "" : "down"}loading`,
			directObject: "service worker",
			thread: id,
			cur: 0,
			total: 1,
			status: "",
		},
	};
}

export default function Init() {
	const dict = useDict();
	const shared = useStore("shared");
	const task = useTable("task", "shared");
	const worker = useContext(ServiceWorker);
	const [id, setId] = useState("");
	const [pub, setPub] = useState<Publication | undefined>();
	const { route } = useLocation();

	useEffect(() => {
		if (!worker || !shared) return;

		const lang = shared.getValue("lang");
		const [id, pub] = Object.entries(publications).find(([_, v]) =>
			v.lang == lang
		) ?? ["bsb", publications.bsb];
		setId(id);
		setPub(pub);
		worker.postMessage({ type: "add", pub });
	}, [worker, shared]);

	useEffect(() => {
		console.log("task", task, id);
		if (id && pub && Object.keys(task).length == 0) {
			route(`/${id}/${Object.keys(pub.toc)[0]}`, true);
		}
	}, [task, id]);

	return (
		<div>
			<h1>{template(dict, "loading", "OpenBible")}</h1>
			<ul>
				{Object.values(defaultTask(worker) ?? task).map((t) => {
					if (t.cur == t.total) {
						setTimeout(() => shared?.delRow("task", t.id as string), 1000);
					}
					return (
						<li>
							<h2>{template(dict, t.verb, t.directObject)}</h2>
							<div>{t.cur} / {t.total}</div>
							<div>{t.status}</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
