import { template, useDict } from "../i18n.ts";

function defaultTask() {
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

export default function Tasks() {
	const dict = useDict();

	return (
		<div>
			<h1>{template(dict, "loading", "OpenBible")}</h1>
			<ul>
				{Object.values(defaultTask()).map((t) => {
					//if (t.cur == t.total) {
					//	setTimeout(() => shared.delRow("task", t.id as string), 1000);
					//}
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
