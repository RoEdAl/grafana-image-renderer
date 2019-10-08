const path = require('path')
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: "./src/app.ts",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, 'dist')
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
    new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false })
  ],
  node: {
    __filename: true,
    __dirname: true
  }
};
