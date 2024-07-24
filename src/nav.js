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
			<nav class="navbar is-info" role="navigation" aria-label="main navigation">
				<div class="navbar-brand">
					<a class="navbar-item" href="/">
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
					<div class="navbar-start">
						<a class="navbar-item">
							Study
						</a>

						<div class="navbar-item has-dropdown is-hoverable">
							<a className={"navbar-link" + (this.state.isDocMenuOpen ? " is-arrow-down" : "")} onClick={this.toggleDocMenu}>
								Documentation
							</a>

							{this.state.isDocMenuOpen && (
								<div className="navbar-dropdown">
									<a class="navbar-item">
										Texts
									</a>
									<a class="navbar-item">
										Contributing
									</a>
									<hr class="navbar-divider" />
									<a class="navbar-item">
										Report an issue
									</a>
								</div>
							)}
						</div>

						<a class="navbar-item">
							About
						</a>
					</div>

					<div class="navbar-end">
						<div class="navbar-item">
							<div class="buttons">
								<a class="button is-primary">
									<strong>Sign up</strong>
								</a>
								<a class="button is-light">
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
