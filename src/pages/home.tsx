import { h, Fragment } from 'preact'
import { Nav, Readers } from '../components'

export const Home = (_props: { path: String }) => (
	<Fragment>
		<Nav />
		<main>
			<Readers />
		</main>
	</Fragment>
)