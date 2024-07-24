import { h, render, Fragment } from 'preact';
import { Nav } from './nav.js';
import './app.sass';

const element = (
	<Fragment>
		<Nav />
	</Fragment>
);

render(element, document.body);
