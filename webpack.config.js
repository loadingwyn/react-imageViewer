module.exports = {
  output: {
    library: 'react-imageslides',
    libraryTarget: 'umd',
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  externals: ['react', 'react-dom', 'prop-types', 'alloyfinger'],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: false,
                declarationMap: false,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // sourceMap: process.env.NODE_ENV !== 'production',
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
};
