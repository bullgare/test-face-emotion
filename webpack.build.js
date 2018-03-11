const merge = require('webpack-merge');
const base = require('./webpack.base');

const config = {};

module.exports = merge(base, config);
