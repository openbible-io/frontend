const path = require('path')
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
	return {
		entry: './src/app.js',
		devtool: 'source-map',
		output: {
			path: path.resolve('dist'),
			filename: '[name].[contenthash:8].bundle.js'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader'
					}
				},
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								hmr: argv.mode === 'development',
							},
						},
						{
							loader: 'css-loader',
							options: {
								modules: {
									mode: 'local',
									localIdentName: argv.mode === 'development'
										? '[path][name]__[local]'
										: '[hash:base64:5]',
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
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyPlugin([
				{ from: 'static', to: 'static' },
			]),
			new HtmlWebpackPlugin({
				template: './src/index.html'
			}),
			new webpack.HashedModuleIdsPlugin(),
			new MiniCssExtractPlugin({
				filename: '[name].[contenthash:6].css',
				chunkFilename: '[name].[contenthash:6].css',
			}),
		],
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all'
					},
				},
			},
		},
	};
}
