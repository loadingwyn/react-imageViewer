// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: { node: 'current' },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
