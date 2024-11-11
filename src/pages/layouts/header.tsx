import type { ComponentChildren } from 'preact';
import Header from '../../components/header.tsx';

export default function Layout(props: { children: ComponentChildren}) {
	return (
		<>
			<Header />
			{props.children}
		</>
	);
}
