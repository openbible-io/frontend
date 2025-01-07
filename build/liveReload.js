const overlay = document.createElement("div");
overlay.id = "liveReloadOverlay";
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.zIndex = "100";
overlay.style.display = "none";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.background = "white";

const contents = document.createElement("pre");

overlay.append(contents);
document.body.append(overlay);

new WebSocket("/liveReload").addEventListener("message", (ev) => {
	/** @type { type: "change"  } | { type: "error", raw: string, html: string }; */
	const data = JSON.parse(ev.data);
	if (data.type == "error") {
		console.error(data.raw);
		contents.innerHTML = data.html;
		overlay.style.display = "flex";
	} else if (data.type == "change") {
		// I used to have a special CSS stylesheet swapping impl here,
		// but this is much simpler.
		location.reload();
	} else {
		console.error("unknown event from dev server", ev);
	}
});
