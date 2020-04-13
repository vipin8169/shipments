const webpack = require('webpack')
const { html, getVersion } = require('./scripts/html')
const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const VERSION = getVersion()

const cfg = {
	entry: {
		app: './src/index.tsx',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
			{
				test: /\.svg$/,
				use: ['@svgr/webpack'],
			},
		],
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
}

module.exports = [
	{
		...cfg,
		mode: 'production',
		name: 'production',
		plugins: [
			new webpack.DefinePlugin({
				GLOBAL_IS_PRODUCTION: JSON.stringify(true),
				GLOBAL_VERSION: JSON.stringify(VERSION),
			}),
		],
	},
	{
		...cfg,
		name: 'development',
		mode: 'development',
		devtool: 'source-map',
		devServer: {
			contentBase: './web',
			before: (app, server, compiler) => {
				app.get('/', (req, res) => {
					res.set('Content-Type', 'text/html')
					res.send(
						html({
							VERSION,
							IS_PRODUCTION: JSON.stringify(false),
							SHIPMENTS_URL: new Handlebars.SafeString(
								process.env.SHIPMENTS_URL,
							),
							FALLBACK_SHIPMENTS: new Handlebars.SafeString(
								fs.readFileSync(
									path.join(process.cwd(), 'dist', 'shipments.json'),
								),
							),
						}),
					)
				})
			},
		},
		module: {
			rules: [
				...cfg.module.rules,
				{
					enforce: 'pre',
					test: /\.js$/,
					loader: 'source-map-loader',
				},
			],
		},
		plugins: [
			new webpack.DefinePlugin({
				GLOBAL_IS_PRODUCTION: JSON.stringify(false),
				GLOBAL_VERSION: JSON.stringify(VERSION),
			}),
		],
	},
]
