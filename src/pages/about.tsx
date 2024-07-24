import { h, Fragment } from 'preact'
import { Nav } from '../components'

export const About = (_props: { path: String }) => (
	<Fragment>
		<Nav />
		<main>
			<h1>About</h1>
			<p>
				This is a site that renders open source UnfoldingWord translations.
			</p>
		</main>
	</Fragment>
)