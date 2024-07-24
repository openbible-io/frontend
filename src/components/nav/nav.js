import { h } from 'preact'
import { Link } from 'preact-router/match';
import styles from './nav.css'
import { bugs } from '../../../package.json';

export function Nav() {
	return (
		<header class={styles.header}>
			<nav class={styles.navbarGrow}>
				<ul class={styles.navbar}>
					<li><Link class={styles.navbarBrand} href="/">Open Bible</Link></li>
					<li><Link href="/study">Study</Link></li>
					<li><Link href="/about">About</Link></li>
					<li><a target="_blank" href={bugs.url}>Report an issue</a></li>
				</ul>
			</nav>
			<div>
				<form>
					<input placeholder="Search"></input>
				</form>
			</div>
		</header>

	)
}
