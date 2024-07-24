import { h, Component } from 'preact'
import { Link } from 'preact-router/match';
import { classnames } from '../utils'
import styles from './nav.css'

export class Nav extends Component {
	state = {
		isBurgerOpen: false,
		isDocMenuOpen: false
	}

	toggleHamburger = _event => this.setState({ isHamburgerOpen: !this.state.isBurgerOpen })
	toggleDocMenu = _event => this.setState({ isDocMenuOpen: !this.state.isDocMenuOpen })

	render() {
		return (
			<nav class={styles.navbar} role="navigation" aria-label="main navigation">
				<Link class={styles.navbrand} href="/">
					Open Bible
				</Link>

				{/* <a
					role="button"
					class={classnames(styles.burger, this.state.isBurgerOpen && styles.burgerActive)}
					aria-label="menu"
					aria-expanded={this.state.isBurgerOpen}
					onClick={this.toggleHamburger}
				>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
				</a> */}

				<Link href="/study">
					Study
				</Link>

				<div class="navbar-item has-dropdown is-hoverable">
					<Link onClick={this.toggleDocMenu}>
						About
					</Link>

					{this.state.isDocMenuOpen && (
						<div class="navbar-dropdown">
							<Link href="/about/texts">
								Texts
							</Link>
							<Link href="/about/contributing">
								Contributing
							</Link>
							<hr class="navbar-divider" />
							<a target="_blank" href="https://github.com/thesmartwon/openbible/issues/new">
								Report an issue
							</a>
						</div>
					)}
				</div>
			</nav>
		)
	}
}
