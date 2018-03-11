const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Output extracted CSS to a file
const cssPlugin = new ExtractTextPlugin({
  filename:  (getPath) => {
    return getPath('[name].css');
  }
});

// Output extracted HTML to a file
const htmlPlugin = new ExtractTextPlugin({
  filename:  (getPath) => {
    return getPath('[name].html');
  }
});

module.exports = {
  entry: {
    bundle: './src/index.js',
    style: './src/style.css',
    index: './index.html'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    publicPath: "/build/"
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          compact: false,
          presets: [
            'es2015',
            // 'react',
            'stage-0',
            ['env', {targets: {browsers: ['last 2 versions']}}]
          ]
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'style-loader'
        })
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: 'html-loader'
        })
      },
    ]
  },
  plugins: [
    cssPlugin,
    htmlPlugin
  ],
};