import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Carousel from './Carousel';

import './css/style.css';
import { deserts } from './Deserts';

class App extends Component {

  render() {
    return (
      <div className="wrapper">
        <main className="main">
          <h1 className="main__title">Deserts of the world</h1>
          <Switch>
            <Route path="/" render={(props) => <Carousel {...props} data={deserts} />} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
