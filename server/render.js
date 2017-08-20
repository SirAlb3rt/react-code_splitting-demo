import React from 'react';
import ReactDOM from 'react-dom/server';
import App from '../src/containers/App';
import flushChunks from 'webpack-flush-chunks';
import { logScript, logStyle } from './logger';
import { flushChunkNames } from 'react-universal-component/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from '../src/redux/reducers';

export default ({ clientStats }) => (req, res) => {
  let promises = [];
  const chunkNames = flushChunkNames();
  const {
    js,
    scripts,
    cssHash,
    styles,
    stylesheets
  } = flushChunks(clientStats, {
    chunkNames
  });

  logScript(scripts);
  logStyle(stylesheets);

  Promise.all(promises).then(() => {
    let preLoadedState = {
      users: {
        users: [],
        page: 10,
        fetching: false,
        fetched: false,
        error: null
      }
    };
    const store = createStore(reducers, preLoadedState);

    const app = ReactDOM.renderToString(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const state = store.getState();

    res.render('index', {
      app: app,
      js: js,
      styles: styles,
      cssHash: cssHash,
      state: JSON.stringify(state)
    });
    res.end();
  });
};
