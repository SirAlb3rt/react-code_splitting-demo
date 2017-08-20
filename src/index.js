import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { logger } from 'redux-logger';
import App from './containers/App';
import AppContainer from 'react-hot-loader/lib/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';
import reducers from './redux/reducers';

const isDev = process.env.NODE_ENV === 'development';
const middleware = isDev ? applyMiddleware(logger) : applyMiddleware();

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__STATE__;

// Allow the passed state to be garbage-collected
delete window.__STATE__;

// Create Redux store with initial state
const initialStore = createStore(reducers, preloadedState, middleware);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./containers/App', () => {
    const App = require('./containers/App').default;
    ReactDOM.render(
      <AppContainer>
        <Provider store={initialStore}>
          <App />
        </Provider>
      </AppContainer>,
      document.getElementById('app')
    );
  });
}

ReactDOM.render(
  <AppContainer>
    <Provider store={initialStore}>
      <App />
    </Provider>
  </AppContainer>,
  document.getElementById('app')
);
