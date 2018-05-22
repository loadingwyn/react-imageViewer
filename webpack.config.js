module.exports = {
  output: {
    library: 'react-imageslides',
    libraryTarget: 'umd',
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  externals: ['react', 'react-dom', 'prop-types', 'alloyfinger'],
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
              // sourceMap: process.env.NODE_ENV !== 'production',
              minimize: true,
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  //   plugins:
  //  [
  //    new webpack.optimize.UglifyJsPlugin({
  //      beautify: false,
  //      comments: false,
  //      sourceMap: true,
  //      compress: {
  //        warnings: false,
  //        drop_console: true,
  //        collapse_vars: true,
  //        reduce_vars: true,
  //      },
  //    }),
  //    new webpack.optimize.ModuleConcatenationPlugin(),
  //    new BundleAnalyzerPlugin(),
  //  ],
};
