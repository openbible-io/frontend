import { createResource, Suspense, ErrorBoundary } from 'solid-js';
import { Skeleton, Spinner } from './index';
import styles from './inner-html.module.css';

export interface InnerHTMLProps {
	url: string;
};
export function InnerHTML(props: InnerHTMLProps) {
	async function fetcher(url: string): Promise<string> {
		return fetch(url)
			.then(res => {
				if (res.ok) return res.text();
				throw Error(`${res.statusText}\n${url}`);
			});
	}
	const [html, { refetch }] = createResource(props.url, fetcher);

	return (
		<ErrorBoundary fallback={(err, reset) => errorBoundaryFallback(err, () => {
			refetch();
			reset();
		})}>
			<Suspense fallback={<Spinner />}>
				<div class={styles.innerHtml} innerHTML={html()} />
			</Suspense>
		</ErrorBoundary>
	);
}
function errorBoundaryFallback(err: any, reset: () => void) {
	return (
		<div>
			{err.toString()}
			<button onClick={reset}>
				Retry
			</button>
		</div>
	);
}
