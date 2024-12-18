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

	useEffect(() => {
		const ref = document.getElementById("notificationsDrawer") as HTMLDivElement;
		ref?.scrollTo(0, ref.scrollHeight);
	}, [nots]);

	return (
		<Drawer
			id="notificationsDrawer"
			position="right"
			autoOpen
			class={classnames(
				"bg-transparent pointer-events-none",
				"overflow-x-hidden [scrollbar-width:none]",
				"open:flex flex-col gap-4",
			)}
		>
			{/*
				* Workaround for justify-end not allowing scrolling.
				* See https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
				*/}
			<div class="mt-auto" />
			{nots.map((n) => <Notification key={n.id} {...n} />)}
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
	const [fadingOut, setFadingOut] = useState(false);
	const timer = useRef(-1);

	function remove() {
		const newNotifications = notifications.get().filter((n) =>
			n.id != props.id
		);
		notifications.set(newNotifications);
	}

	useEffect(() => {
		timer.current = setTimeout(() => setFadingOut(true), 4000);
	}, []);

	return (
		<article
			ref={ref}
			class={classnames(
				"bg-mix-[text/20]",
				"ring-1 drop-shadow-2xl pointer-events-auto",
				"p-4",
				"flex items-start justify-between gap-4",
				// Animate
				fadingOut ? "duration-1000" : "duration-200",
				// Animate opacity
				"starting:opacity-0",
				// Animate translation
				"starting:translate-x-[calc(var(--dir)*100%)]",
				// Animate exit
				fadingOut && "opacity-0",
			)}
			onPointerOver={() => {
				setFadingOut(false);
				clearTimeout(timer.current);
				ref.current?.getAnimations().forEach((a) => a.cancel());
			}}
			onTransitionEnd={() => fadingOut && remove()}
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
