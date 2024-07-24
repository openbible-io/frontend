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
		const res = await fetch(url);
		if (!res.ok) throw Error(`${res.statusText}\n${url}`);
		if (props.onSuccess) props.onSuccess();
		const text = await res.text();
		return amender(text);
	}
	const [html, { refetch }] = createResource(props.url, fetcher);
	const clas = () => [styles.innerHtml, props?.div?.class].filter(Boolean).join(' ');

	return (
		<ErrorBoundary fallback={(err, reset) => errorBoundaryFallback(err, () => {
			refetch();
			reset();
		})}>
			<Suspense fallback={
				<>
					<div {...props.div} class={clas()} innerHTML={amender('')} />
					<Spinner />
				</>
			}>
				<div {...props.div} class={clas()} innerHTML={html()} />
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
