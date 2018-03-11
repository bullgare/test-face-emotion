const merge = require('webpack-merge');
const base = require('./webpack.base');

const config = {
  serve: {
    dev: { publicPath: '/' }
  },
};

module.exports = merge(base, config);
