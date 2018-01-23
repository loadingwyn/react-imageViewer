const { resolve } = require('path');
const webpack = require('webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  entry: [
    process.env.NODE_ENV === 'production'
      ? './src/index.js'
      : './demo/mobile/demo.js',
  ],
  output: {
    path: resolve(__dirname, 'dist'),
    library: 'react-imageslides',
    libraryTarget: 'umd',
    filename: 'bundle.js',
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  externals:
    process.env.NODE_ENV === 'production'
      ? ['react', 'react-dom', 'prop-types', 'alloyfinger']
      : [],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
              minimize: true,
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins:
    process.env.NODE_ENV === 'production'
      ? [
        new webpack.optimize.UglifyJsPlugin({
          beautify: false,
          comments: false,
          compress: {
            warnings: false,
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true,
          },
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
      ]
      : [],
};
