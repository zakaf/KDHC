import React from 'react';
import './App.css';
import NewsCard from './NewsCard';
import {Container} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        fetch("http://localhost:3001/news")
            .then(response => response.json())
            .then(json => {
                this.setState({
                    news: json
                })
            })
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>뉴스보기</h2>
                </div>
                <Container text-align="center" className="Container">
                    <NewsCard news={this.state.news}/>
                </Container>
            </div>
        );
    }
}

export default App;
