module.exports = {
	presets: [['@babel/preset-env', {
		loose: true,
		corejs: 3,
		useBuiltIns: 'entry',
		exclude: ['transform-regenerator', 'transform-async-to-generator'],
	}]],
	plugins: [
		['@babel/plugin-transform-react-jsx', {
			pragma: 'h'
		}],
		'@babel/plugin-proposal-class-properties',
		['@babel/plugin-transform-typescript', {
			isTSX: true,
			jsxPragma: 'h',
		}],
	],
}
