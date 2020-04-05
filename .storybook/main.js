const path = require('path');

// your app's webpack.config.js
const custom = require('../webpack.config.js');

module.exports = {
  webpackFinal: config => {
    config.resolve.extensions.push('.ts', '.tsx');
    return { ...config, module: { ...config.module, rules: custom.module.rules } };
  },
  stories: ['../stories/**/*.tsx'],
  addons: ['@storybook/addon-viewport/register'],
};
