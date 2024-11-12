// Reminder: Shared between UI and service worker.
// Everything here is duplicated!
import type { SharedStore } from "./stores/shared.ts";

export type Opts = {
	directObject?: string;
	total?: number;
};

let id = 0;
export default class Task {
	#id: string;
	#cur = 0;
	#total = 0;
	directObject: string;
	#status = "";

	constructor(
		public store: SharedStore,
		public thread: string,
		public verb: string,
		opts?: Opts,
	) {
		this.#id = `${thread}${id++}`;
		this.#total = opts?.total ?? 1;
		this.directObject = opts?.directObject ?? "";
		this.updateStore();
	}

	updateStore() {
		this.store.setRow("task", this.#id, {
			id: this.#id,
			verb: this.verb,
			directObject: this.directObject ?? "",
			thread: this.thread,
			cur: this.#cur,
			total: this.#total,
			status: this.#status,
		});
	}

	set cur(val: number) {
		this.#cur = val;
		this.updateStore();
	}
	get cur() {
		return this.#cur;
	}

	set total(val: number) {
		this.#total = val;
		this.updateStore();
	}
	get total() {
		return this.#total;
	}

	set status(val: string) {
		this.#status = val;
		this.updateStore();
	}
	get status() {
		return this.#status;
	}

	setDone() {
		this.#cur = this.#total;
		this.updateStore();
	}
	isDone() {
		return this.#cur == this.#total;
	}

	do<T extends { toString: () => string }>(
		workItems: T[],
		workFn: (t: T) => Promise<void>,
	): Promise<void[]> {
		return Promise.all(workItems.map(async (u) => {
			this.status = u.toString();
			const res = await workFn(u);
			await new Promise((res) => setTimeout(res, 1000));
			this.cur = this.cur++;
			return res;
		}));
	}
}
