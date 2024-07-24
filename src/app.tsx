import { h, render } from 'preact'
import { useEffect } from 'preact/hooks'
import Router from 'preact-router'
import { Home, About, Settings } from './pages'
import { loadLocalCSSVars } from './utils/cssVars'
import './app.css'

function App() {
	useEffect(loadLocalCSSVars, [])

	return (
		<Router>
			<Home path="/" />
			<About path="/about" />
			<Settings path="/settings" />
		</Router>
	)
}

render(
	<App />,
	document.getElementById('root') as HTMLElement
)
