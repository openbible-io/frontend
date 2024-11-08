new EventSource("/liveReload").addEventListener("change", (e) => {
	const { removed, added } = JSON.parse(e.data);
	for (const href of added.concat(removed)) {
		if (!href.endsWith(".css")) return location.reload();
	}
	added.forEach((a) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = `/${a}`;
		document.head.append(link);
	});
	removed.forEach((r) => {
		const link = document.querySelector(`link[href="/${r}"]`);
		document.head.removeChild(link);
	});
});
