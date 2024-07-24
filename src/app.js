import { h, render, Component } from 'preact'
import Router from 'preact-router'
import { Home, About, Settings } from './pages'
import { loadLocalCSSVars } from './utils/cssVars'
import './app.css'

class App extends Component {
	componentWillMount() {
		loadLocalCSSVars()
	}

	render() {
		return (
			<Router>
				<Home path="/" />
				<About path="/about" />
				<Settings path="/settings" />
			</Router>
		)
	}
}

render(<App />, document.getElementById('root'))
