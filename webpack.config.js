const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    // 'react-hot-loader/patch',
    // 'webpack-dev-server/client?http://localhost:8080',
    // 'webpack/hot/only-dev-server',
    './src/dev.js',
  ],
  output: {
    path: resolve(__dirname, 'dist'),
    library: 'react-imageslides',
    libraryTarget: 'umd',
    filename: 'bundle.js',
  },
  // externals: [
  //   'react',
  //   'react-dom',
  //   'alloyfinger',
  // ],
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
      use: ['style-loader', {
        loader: 'css-loader',
        options: {
        //  sourceMap: true,
          minimize: true,
          importLoaders: 1,
        },
      }, 'postcss-loader'],
    }],
  },
  plugins: [
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
