new EventSource("/liveReload").addEventListener("change", (ev) => {
	const data = JSON.parse(ev.data);
	if (data) {
		// TODO: nice UI overlay
		console.error(data);
	} else {
		// I used to have a special CSS stylesheet swapping impl here,
		// but this is much simpler.
		location.reload();
	}
});
