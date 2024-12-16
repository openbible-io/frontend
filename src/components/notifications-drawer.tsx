import classnames from "../lib/classnames.ts";
import Drawer from "./drawer.tsx";
import { useStore } from "@nanostores/preact";
import { notifications } from "../stores/client.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import { CloseButton } from "./button.tsx";

let count = 0;
export function addNotification() {
	const id = count++;
	const props: NotificationProps = {
		id,
		icon: "icon-[lucide--circle-check-big] text-green-300",
		title: `great success ${id}`,
		body: "much good such wow so hap many celebrate",
	};
	notifications.set([...notifications.get(), props]);
}

export default function NotificationsDrawer() {
	const nots = useStore(notifications);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const r = ref.current;
		if (!r) return;

		r.scrollTo(0, r.scrollHeight);
	}, [nots]);

	return (
		<Drawer
			ref={ref}
			position="right"
			autoOpen
			class="bg-transparent pointer-events-none overflow-x-hidden [scrollbar-width:none] gap-4 justify-end"
		>
			{nots.map((n) => <Notification {...n} />)}
		</Drawer>
	);
}

export interface NotificationProps {
	id: number;
	icon: string;
	title: string;
	body: string;
}
export const Notification = (props: NotificationProps) => {
	const ref = useRef<HTMLElement>(null);
	const [dirty, setDirty] = useState(false);
	const dirtyRef = useRef(dirty);

	dirtyRef.current = dirty;

	function remove() {
		const newNotifications = notifications.get().filter((n) =>
			n.id != props.id
		);
		console.log("remove", props.id);
		notifications.set(newNotifications);
	}

	//useEffect(() => {
	//	if (!ref.current) return;
	//	console.log(props.id);
	//
	//	console.log("listen", props.id);
	//
	//	Promise.allSettled(
	//		ref.current.getAnimations().map((animation) => animation.finished),
	//	)
	//		.then(() => {
	//			if (!dirtyRef.current) remove();
	//		});
	//}, [ref.current]);

	return (
		<article
			ref={ref}
			class={classnames(
				"bg-mix-[text/20]",
				"ring-1 drop-shadow-2xl pointer-events-auto",
				"p-4 flex items-start justify-between gap-4",
				"drawer-animate",
			)}
			onPointerOver={() => {
				console.log("cancel", props.id);
				setDirty(true);
			}}
		>
			<div class={classnames("icon mr-1", props.icon)} />
			<div class="flex-1">
				<p class="text-lg font-semibold">{props.title}</p>
				<p>{props.body}</p>
			</div>
			<CloseButton onClick={remove} />
		</article>
	);
};
