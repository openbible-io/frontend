import { h, render, Fragment } from 'preact'
import { Nav, Readers } from './components'
import './app.css'

const element = (
	<Fragment>
		<Nav className="hi" />
		<main>
			<Readers />
		</main>
	</Fragment>
)

render(element, document.body)
