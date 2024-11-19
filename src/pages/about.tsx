export default function About() {
	return (
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
	);
}
