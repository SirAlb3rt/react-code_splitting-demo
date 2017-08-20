const express = require('express');
const morgan = require('morgan');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackHotServerMiddleware = require('webpack-hot-server-middleware');
const clientConfig = require('../webpack/webpack.config.client');
const serverConfig = require('../webpack/webpack.config.server');
const { colorfulLog, logServerConfig } = require('./logger');

const outputPath = clientConfig.output.path;
const publicPath = clientConfig.output.publicPath;

const isDev = process.env.NODE_ENV === 'development';
const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(morgan(colorfulLog));

let isBuilt = false;

const done = () => {
  !isBuilt &&
    app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0', err => {
      isBuilt = true;
      logServerConfig(err);
    });
};

if (isDev) {
  const compiler = webpack([clientConfig, serverConfig]);
  const clientCompiler = compiler.compilers[0];
  const options = { publicPath, stats: { colors: true } };

  app.use(webpackDevMiddleware(compiler, options));
  app.use(webpackHotMiddleware(clientCompiler));
  app.use(webpackHotServerMiddleware(compiler));

  compiler.plugin('done', done);
} else {
  webpack([clientConfig, serverConfig]).run((err, stats) => {
    const clientStats = stats.toJson().children[0];
    const serverRender = require('../build/server/main.js').default;

    app.use(publicPath, express.static(outputPath));
    app.use(serverRender({ clientStats }));

    done();
  });
}
