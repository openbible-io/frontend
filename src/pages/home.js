import { h, Fragment } from 'preact'
import { Nav, Readers } from '../components'

export const Home = () => (
	<Fragment>
		<Nav />
		<main>
			<Readers />
		</main>
	</Fragment>
)