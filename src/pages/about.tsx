import { repository } from '../../package.json';
import styles from './about.module.css';

export function About() {
	return (
		<div class={styles.about}>
			<h1>About</h1>
			<p>
				A customizable Bible study app.
			</p>
			<section>
				<h2>Privacy</h2>
				This site only serves first-party content. It will <b>NEVER</b> use client-side trackers or analytics. All analytics are done on the backend without logging IP addresses.

				<p>
					This content is hosted on Cloudflare which stores IP addresses for the purpose of DDOS protection, region locking, and region analytics.
				</p>
			</section>
			<section>
				<h2>Links</h2>
				<ul>
					<li>
						<a target="_blank" href={repository as unknown as string}>GitHub</a>
					</li>
				</ul>
			</section>
			<div style={{ flex: 1 }} />
			<div>
				Build {import.meta.env['OPENBIBLE_COMMIT_DATE']}_{import.meta.env['OPENBIBLE_COMMIT']}
			</div>
		</div>
	);
}
