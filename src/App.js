import React, { Component } from 'react';
import Carousel from './Carousel';

import './css/style.css';
import { deserts } from './data/Deserts';

class App extends Component {

  render() {
    return (
      <div className="wrapper">
        <main className="main">
          <h1 className="main__title">Deserts of the world</h1>
          <Carousel data={deserts} />
        </main>
      </div>
    );
  }
}

export default App;
