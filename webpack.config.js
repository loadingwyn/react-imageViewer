const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    // 'react-hot-loader/patch',
    // 'webpack-dev-server/client?http://localhost:8080',
    // 'webpack/hot/only-dev-server',
    './src/index.jsx',
  ],
  output: {
    filename: 'js/bundle.js',
    path: resolve(__dirname, 'public'),
  },
  // devtool: 'source-map',
  // devServer: {
  //   hot: true,
  //   contentBase: resolve(__dirname, 'public'),
  //   publicPath: '/static/',
  //   historyApiFallback: true,
  // },
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
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
           //  sourceMap: true,
            minimize: true,
            importLoaders: 1,
            modules: true,
            localIdentName: '[local]___[hash:base64:5]',
          },
        }, 'postcss-loader'],
      }),
    }],
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './index.html',
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      allChunks: true,
    }),
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
  ],
};
