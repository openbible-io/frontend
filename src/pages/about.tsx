import Layout from "./layouts/header.tsx";

export default function About() {
	return (
		<Layout provideWorker={false}>
			<table>
				<tr>
					<td>Version</td>
					<td>{import.meta.env.OPENBIBLE_VERSION}</td>
				</tr>
				<tr>
					<td>Date</td>
					<td>{import.meta.env.OPENBIBLE_VERSION_DATE}</td>
				</tr>
			</table>
		</Layout>
	);
}
