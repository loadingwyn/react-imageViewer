const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './app/index.jsx',
  ],
  output: {
    filename: 'js/bundle.js',
    path: resolve(__dirname, 'public/static'),
    publicPath: '/static/',
  },
  devtool: 'source-map',
  devServer: {
    hot: true,
    contentBase: resolve(__dirname, 'public'),
    publicPath: '/static/',
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: [
         { loader: 'style-loader' }, {
           loader: 'css-loader',
           options: {
             sourceMap: true,
             importLoaders: 1,
             modules: true,
             localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
           },
         }, 'postcss-loader',
      ],
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: './index.html',
    }),
    // new ExtractTextPlugin({
    //   filename: 'css/[name].css',
    //   allChunks: true,
    // }),
  ],
};
