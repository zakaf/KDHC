import React, { Component } from 'react';
import './App.css';
import NewsCard from './NewsCard';
import 'semantic-ui-css/semantic.min.css';
import SmalldotsFetch from 'smalldots/lib/Fetch';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>뉴스보기</h2>
        </div>
        <p className="App-intro">
            <NewsCard />
        </p>
      </div>
    );
  }
}

export default App;
