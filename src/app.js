import { h, render, Fragment } from 'preact'
import { Nav, Readers } from './components'
import './app.css'

const App = (
	<Fragment>
		<Nav />
		<main>
			<Readers />
		</main>
	</Fragment>
)

render(App, document.getElementById('root'))
