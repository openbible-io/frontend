const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SizePlugin = require('size-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = (_env, argv) => {
	const isDev = argv.mode === 'development'

	return {
		entry: './src/app.js',
		output: {
			path: path.resolve('dist'),
			filename: '[name].[contenthash:8].bundle.js'
		},
		devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map',
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							cacheDirectory: '.cache',
							cacheCompression: false
						}
					}
				},
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								hmr: isDev,
							},
						},
						{
							loader: 'css-loader',
							options: {
								modules: {
									mode: 'local',
									localIdentName: isDev ? '[path][name]__[local]' : 'css-[hash:base64:5]',
								},
							},
						}
					]
				},
				{
					test: /\.(png|jpg|gif)$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 8192,
							},
						}
					]
				},
				{
					test: /\.svg$/,
					use: ['preact-svg-loader'],
				},
			]
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: './src/index.html'
			}),
			new MiniCssExtractPlugin({
				filename: '[name].[contenthash:6].css',
				chunkFilename: '[name].[contenthash:6].css',
			}),
			new webpack.HashedModuleIdsPlugin(),
			new CopyPlugin([{ from: 'static', to: 'static' }]),
			...(!isDev
				? [
					new CleanWebpackPlugin(),
					new SizePlugin(),
					// new BundleAnalyzerPlugin(),
				]
				: []),
		],
		optimization: {
			splitChunks: {
				minSize: 1500, // MTU
				cacheGroups: {
					vendors: {
						test: /[\\/]node_modules[\\/]/,
						chunks: 'all',
						priority: 1,
					}
				},
			},
			runtimeChunk: 'single',
		},
		stats: 'minimal',
	};
}
