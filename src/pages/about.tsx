import { h, Fragment } from 'preact'
import { Nav } from '../components'

export function About(_props: { path: String }) {
	return (
		<Fragment>
			<Nav />
			<main>
				<div>
					<h2>About</h2>
					<p>
						This is a site that (so far) renders
						the <a href="https://git.door43.org/unfoldingWord/en_ult">en_ult</a>
						&nbsp;and <a href="https://git.door43.org/unfoldingWord/en_ust">en_ust</a> translations.
					</p>
					<p>
						It does so by rendering the USFM markdown to JSON
						in <a href="https://github.com/thesmartwon/usfm2json">usfm2json</a> to paragraphs,
						and then rendering those paragraphs to HTML following some rules for verse numbers,
						punctuation, highlights, and notes. Currently your highlights and notes are saved
						to your browser's local storage.
					</p>
					<p>
						It's written using&nbsp;
						<a href="https://preactjs.com/">Preact</a>
						, <a href="https://babeljs.io/">Babel</a>
						, and a lot of <a href="https://webpack.js.org/">Webpack</a> sorcery.
						The few icons come
						from <a href="https://fontawesome.com/">FontAwesome</a>&nbsp;
						or <a href="https://material.io/resources/icons/">Material Design.</a>
					</p>
					<p>
						The source code is available
						on <a href="https://github.com/thesmartwon/openbible">Github</a> and it's
						deployed
						using <a href="https://pages.github.com/">Github Pages.</a>&nbsp;
						I welcome contributions, there's still a lot of work to be done!
					</p>
				</div>
			</main>
		</Fragment>
	)
}