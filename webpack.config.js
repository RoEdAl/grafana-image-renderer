const path = require('path')
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const srcDir = path.resolve(__dirname, 'src');

module.exports = {
  target: 'node',
  entry: "./src/app.ts",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: (info) => {
	if (info.resourcePath.startsWith('./src/')) {
		return path.relative( srcDir, info.resourcePath );
	}
    }
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
	test: /\.tsx?$/,
	exclude: /node_modules/,
	loader: "ts-loader"
      }
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin({ banner: 'require("source-map-support").install({environment: "node"});', raw: true, entryOnly: false })
  ],
  node: {
    process: true,
    __filename: false,
    __dirname: false
  }
};
