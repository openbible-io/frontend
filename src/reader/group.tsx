import { For, createResource, Show } from 'solid-js';
import { Reader } from '../reader/reader';
import { useLocalStorage } from '../reactivity/index';
import { BibleInfos, VersionBookChapter, infosUrl, vbcUrl } from '../bibles';
import styles from './group.module.css';

export const defaultReaders = [
	// Single reader in case on small display
	{ version: 'en_ust', book: 'gen', chapter: 1 },
] as VersionBookChapter[];

export function ReaderGroup() {
	// Source of truth on load.
	// Then <Reader /> becomes the source of truth and just calls back to update this.
	const [readers, setReaders] = useLocalStorage('readers', defaultReaders);
	if (readers().length == 0) setReaders(defaultReaders);

	const cached = localStorage.getItem('index');
	const [indices] = createResource<BibleInfos>(
		async () => fetch(infosUrl).then(res => res.json()).then(res => {
			localStorage.setItem('index', JSON.stringify(res));
			return res;
		}),
		{
			initialValue: cached ? JSON.parse(cached) : undefined,
		},
	);

	function onAddReader(index: number) {
		const newReaders = [...readers()];
		newReaders.splice(index + 1, 0, defaultReaders[0]);
		setReaders(newReaders);
	}

	function onCloseReader(index: number) {
		const newReaders = [...readers()];
		newReaders.splice(index, 1);
		setReaders(newReaders);
	}

	function onNavChange(index: number, vbc: VersionBookChapter) {
		// No ... to avoid <For> doing unneeded work
		const newReaders = readers();
		newReaders[index] = vbc;
		setReaders(newReaders);
	}

	return (
		<div class={styles.readerGroup}>
			<For each={readers()}>
				{(vbc, index) =>
					<Show
						when={indices()}
						fallback={
							<>
								Fetching indices...
								{/* Indices is usually larger than this chapter which can be prefetched */}
								<link
									rel="prefetch"
									type="fetch"
									crossorigin="anonymous"
									href={vbcUrl(vbc)}
								/>
							</>
						}>
						<Reader
							vbc={vbc}
							indices={indices()!}
							onAddReader={() => onAddReader(index())}
							onCloseReader={() => onCloseReader(index())}
							onNavChange={c => onNavChange(index(), c)}
							canClose={readers().length > 1}
							isLast={index() === readers().length - 1}
						/>
						{index() !== readers().length - 1 &&
							<div class={styles.dragbar} />
						}
					</Show>
				}
			</For>
		</div>
	);
}
