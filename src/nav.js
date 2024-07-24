import { h, Component } from 'preact';

export class Nav extends Component {
	state = {
		isHamburgerOpen: false,
		isDocMenuOpen: true
	}

	toggleHamburger = _event => this.setState({ isHamburgerOpen: !this.state.isHamburgerOpen });
	toggleDocMenu = _event => this.setState({ isDocMenuOpen: !this.state.isDocMenuOpen });

	render() {
		return (
			<nav className="navbar is-info" role="navigation" aria-label="main navigation">
				<div className="navbar-brand">
					<a className="navbar-item" href="/">
						Open Bible
					</a>

					<a
						role="button"
						className={"navbar-burger burger" + (this.state.isHamburgerOpen ? " is-active" : "")}
						aria-label="menu"
						aria-expanded={this.state.isHamburgerOpen}
						onClick={this.toggleHamburger}
					>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
					</a>
				</div>

				<div className={"navbar-menu" + (this.state.isHamburgerOpen ? " is-active" : "")}>
					<div className="navbar-start">
						<a className="navbar-item">
							Study
						</a>

						<div className="navbar-item has-dropdown is-hoverable">
							<a className={"navbar-link" + (this.state.isDocMenuOpen ? " is-arrow-down" : "")} onClick={this.toggleDocMenu}>
								Documentation
							</a>

							{this.state.isDocMenuOpen && (
								<div className="navbar-dropdown">
									<a className="navbar-item">
										Texts
									</a>
									<a className="navbar-item">
										Contributing
									</a>
									<hr className="navbar-divider" />
									<a className="navbar-item">
										Report an issue
									</a>
								</div>
							)}
						</div>

						<a className="navbar-item">
							About
						</a>
					</div>

					<div className="navbar-end">
						<div className="navbar-item">
							<div className="buttons">
								<a className="button is-primary">
									<strong>Sign up</strong>
								</a>
								<a className="button is-light">
									Log in
								</a>
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	}
}
