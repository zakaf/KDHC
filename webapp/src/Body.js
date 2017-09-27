import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {Container} from 'semantic-ui-react'
import Login from './Login';
import NewsCard from './NewsCard';
import KeywordCard from "./KeywordCard";
import './Body.css';

class Body extends React.Component {
    render() {
        return (
            <Container textAlign="center" className="Body">
                <Switch>
                    <Route exact path='/' component={NewsCard}/>
                    <Route exact path='/login' component={Login}/>
                    <Route path='/news' component={NewsCard}/>
                    <Route path='/keyword' component={KeywordCard}/>
                </Switch>
            </Container>
        );
    }
}

export default Body;