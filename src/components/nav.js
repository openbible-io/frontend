import { h, Component } from 'preact'
import { Link } from 'preact-router/match';
import styles from './nav.css'
import { bugs } from '../../package.json';

export class Nav extends Component {
	state = {
		isDocMenuOpen: false
	}

	toggleDocMenu = _event => this.setState({ isDocMenuOpen: !this.state.isDocMenuOpen })

	render() {
		return (
			<nav>
				<ul class={styles.navbar}>
					<div class={styles.navbarSection}>
						<li><Link class={styles.navbarBrand} href="/">Open Bible</Link></li>
						<li><Link href="/study">Study</Link></li>
						<li><Link href="/about">About</Link></li>
					</div>
					<div class={styles.navbarSection}>
						<li><a target="_blank" href={bugs.url}>Report an issue</a></li>
						<input></input>
					</div>
				</ul>
			</nav>
		)
	}
}
