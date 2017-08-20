'use strict';

const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const fs = require('fs');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const res = p => path.resolve(__dirname, p);

const modeModules = res('../node_modules');
const entry = res('../server/render.js');
const output = res('../build/server');

// if you're specifying externals to leave unbundled, you need to tell Webpack
// to still bundle `react-universal-component`, `webpack-flush-chunks` and
// `require-universal-module` so that they know they are running
// within Webpack and can properly make connections to client modules:
const externals = fs
  .readdirSync(modeModules)
  .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
  .reduce((externals, mod) => {
    externals[mod] = `commonjs ${mod}`;
    return externals;
  }, {});

const defaultConfig = {
  name: 'server',
  target: 'node',
  output: {
    path: output,
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  entry: ['babel-polyfill', entry],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)(\?.*$|$)/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        // the client needs `css-modules-transform` removed from the babelrc
        // since `ExtractCssChunks` handles css transformation:
        test: /\.(js|jsx)(\?.*$|$)/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ExtractCssChunks.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ]
};

const devConfig = {
  externals,
  devtool: 'eval',
  plugins: [
    new WriteFilePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ]
};

const prodConfig = {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};

module.exports = isDev
  ? merge(defaultConfig, devConfig)
  : merge(defaultConfig, prodConfig);
