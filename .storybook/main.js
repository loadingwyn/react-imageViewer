const path = require('path');

// your app's webpack.config.js
const custom = require('../webpack.config.js');

module.exports = {
  stories: ['../stories/**/*.@(tsx|jsx)'],
};
