const path = require('path');
const webpack = require('webpack');


module.exports = {
	context: path.join(__dirname, 'src'),
	entry: {
		app: './app.js',
		html: './index.html',
	},
	devServer: {
		contentBase: 'build',
		port: 3000,
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'build'),
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'css-loader',
			},
			{
				test: /\.html$/,
				loader: 'file-loader?name=[name].[ext]',
			},
		],
	},
	devtool: '#eval-source-map',
};
