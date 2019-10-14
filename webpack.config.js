const path = require('path')
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const ModuleReplacement = require('./module-replacement-resolver');

module.exports = function(env,argv) {
  const srcDir = path.resolve(__dirname, 'src');
  return {
    target: 'node',
    entry: "./src/app.ts",
    output: {
      filename: "app.js",
      path: path.resolve(__dirname, 'dist'),
      devtoolModuleFilenameTemplate: (info) => {
	if (info.resourcePath.startsWith('./src/')) {
		return path.relative(srcDir, info.resourcePath);
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
      new webpack.BannerPlugin({ banner: 'require("source-map-support").install({environment: "node"});', raw: true, entryOnly: false }),
      ...ModuleReplacement(env)
    ],
    optimization: {
      nodeEnv: 'production',
      minimizer: [new TerserPlugin({
         cache: false,
         parallel: true,
         exclude: /node_modules/,
         sourceMap: true,
         terserOptions: {
           keep_fnames: false,
           keep_classnames: false,
           module: false,
           extractComments: false,
           output: {ecma: 6, comments: false}
         }
      })],
    },
    node: {
      process: false,
      __filename: false,
      __dirname: false
    }

  };
};
