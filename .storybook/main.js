const path = require('path');

// your app's webpack.config.js
const custom = require('../webpack.config.js');

module.exports = {
  webpackFinal: config => {
    return { ...config, module: { ...config.module, rules: custom.module.rules } };
  },
  stories: ['../stories/**/*.js'],
  addons: ['@storybook/addon-viewport/register'],
};
