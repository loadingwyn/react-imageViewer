const precss = require('precss');
const autoprefixer = require('autoprefixer');

module.exports = {
  sourceMap: 'inline',
  plugins: [
    precss,
    autoprefixer,
  ],
};
