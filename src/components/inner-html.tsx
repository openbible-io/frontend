import { createResource, Suspense, ErrorBoundary, JSX } from 'solid-js';
import { Spinner } from './index';
import styles from './inner-html.module.css';

export interface InnerHtmlProps {
	url?: string;
	onSuccess?: () => void;
	div?: JSX.HTMLAttributes<HTMLDivElement>;
	amendHtml?: (hmtl: string) => string;
};
export function InnerHtml(props: InnerHtmlProps) {
	if (!props.url) return null;

	const amender = props.amendHtml ?? (a => a);

	async function fetcher(url: string): Promise<string> {
		await new Promise(res => setTimeout(res, 1000));
		const res = await fetch(url);
		if (!res.ok) throw Error(`${res.statusText}\n${url}`);
		if (props.onSuccess) props.onSuccess();
		const text = await res.text();
		return amender(text);
	}
	const [html, { refetch }] = createResource(props.url, fetcher);

	return (
		<ErrorBoundary fallback={(err, reset) => errorBoundaryFallback(err, () => {
			refetch();
			reset();
		})}>
			<Suspense fallback={
				<>
					<div
						{...props.div}
						data-loading
						class={[styles.innerHtml, props?.div?.class].filter(Boolean).join(' ')}
						innerHTML={amender('')}
					/>
					<Spinner />
				</>
			}>
				<div
					{...props.div}
					class={[styles.innerHtml, props?.div?.class].filter(Boolean).join(' ')}
					innerHTML={html()}
				/>
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
