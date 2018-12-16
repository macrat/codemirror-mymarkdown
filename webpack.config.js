const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	context: path.join(__dirname, 'src'),
	entry: './app.js',
	devServer: {
		contentBase: 'build',
		port: 3000,
	},
	output: {
		filename: 'app.js',
		path: path.join(__dirname, 'build'),
	},
	module: {
		rules: [{
			test: /\.css$/,
			loader: 'css-loader',
		}],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
	],
	devtool: '#eval-source-map',
};
