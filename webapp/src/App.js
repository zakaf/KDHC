import React from 'react';
import './App.css';
import AppHeader from './AppHeader';
import Body from './Body'
import {Container} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 'news'
        };
        this.moveToPage = this.moveToPage.bind(this);
    }

    moveToPage(page) {
        this.setState({
            page: page
        })
    }

    render() {
        return (
            <div>
                <AppHeader page={this.state.page} moveToPage={this.moveToPage}/>
                <Container textAlign="center" className="Body">
                    <Body page={this.state.page}/>
                </Container>
            </div>
        );
    }
}

export default App;
