import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import universal from 'react-universal-component';
const UniversalComponent = universal(import('../Users/index.js'), {
  minDelay: 300
});

@connect(store => {
  return {
    users: store.users
  };
})
export default class App extends Component {
  static propTypes = {
    users: PropTypes.object
  };

  render() {
    return (
      <div>
        {this.props.users.page}
        <div>
          <UniversalComponent />
        </div>
      </div>
    );
  }
}
