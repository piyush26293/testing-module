const webpack = require('webpack');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      'playwright': 'commonjs playwright',
      'playwright-core': 'commonjs playwright-core',
    },
  };
};
