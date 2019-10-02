var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: {
	path: path.resolve(__dirname, 'dist'),
	filename: 'index.bundle.js'
    },
    plugins: [
	new HtmlWebpackPlugin({
	    template: path.resolve(__dirname, 'index.html')
	})
    ],
    module: {
	rules: [
	    {
		test: /\.tsx?$/,
		exclude: /node_modules/,
		use: [
                    { loader: 'ts-loader' }
		]
            },
	    {
		test: /\.css$/,
		exclude: /node_modules/,
		use: [
		    { loader: 'style-loader' },
		    { loader: 'css-loader', options: {
			importLoaders: 1,
		    } },
		    { loader: 'postcss-loader' }
		]
	    }
	]
    }
}
