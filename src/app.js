import { h, render, Fragment } from 'preact';

const element = (
	<Fragment>
		<div>hello</div>
		<div>there</div>
	</Fragment>
);

render(element, document.getElementById('root'));
