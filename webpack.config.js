const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SizePlugin = require('size-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
 
module.exports = (_env, argv) => {
	const isDev = argv.mode === 'development'

	return {
		entry: './src/app.tsx',
		output: {
			path: path.resolve('dist'),
			filename: '[name].[contenthash:8].bundle.js'
		},
		devtool: isDev ? 'cheap-module-source-map' : 'source-map',
		devServer: {
			historyApiFallback: true,
		},
		resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					include: path.resolve(__dirname, 'src'),
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
						},
						'postcss-loader',
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
					test: /.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: 'fonts/'
							}
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
				filename: '[name].[contenthash].css',
				chunkFilename: '[name].[contenthash].css',
			}),
			new webpack.HashedModuleIdsPlugin(),
			new CopyPlugin([{ from: 'static', to: 'static' }]),
			...(isDev
				? [
					new ForkTsCheckerWebpackPlugin({
						async: false,
						checkSyntacticErrors: true,
					}),
				]
				: [
					new CleanWebpackPlugin(),
					new SizePlugin(),
					new BundleAnalyzerPlugin(),
				]
			),
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
			minimize: false,
			runtimeChunk: 'single',
		},
		stats: 'minimal',
	};
}
