import { For, createResource, ResourceReturn, Show } from 'solid-js';
import { Reader } from '../reader/reader';
import { useLocalStorage } from '../../reactivity/index';
import { BibleInfos, VersionBookChapter, infosUrl, vbcUrl } from '../../bibles';
import styles from './group.module.css';

export const defaultReaders = [
	// Single reader in case on small display
	{ version: 'en_ust', book: 'gen', chapter: 1 },
] as VersionBookChapter[];
// Only fetch this once.
let indexCache: ResourceReturn<BibleInfos> | undefined;

export function ReaderGroup() {
	// Source of truth on load.
	// Then <Reader /> becomes the source of truth and just calls back
	// to update this.
	const [readers, setReaders] = useLocalStorage('chapters', defaultReaders);
	if (readers().length == 0) setReaders(defaultReaders);

	indexCache = indexCache || createResource<BibleInfos>(async () =>
		 fetch(infosUrl)
			.then(res => res.json() as Promise<BibleInfos>)
			.then(res => {
				Object.entries(res).forEach(([version, index]) => {
					index.version = version;
				});
				return res;
			})
	);
	const [indices] = indexCache;

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
