import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'semantic-ui-react'
import NewsCard from './NewsCard';
import KeywordCard from "./KeywordCard";
import Callback from "./Callback"
import './css/Body.css';

class Body extends React.Component {
    render() {
        const handleAuthentication = (nextState) => {
            if (/access_token|id_token|error/.test(nextState.location.hash)) {
                this.props.auth.handleAuthentication();
            }
        };

        const openIdSub = this.props.auth.isAuthenticated() ? this.props.auth.getOpenIdSub() : "";

        return (
            <Container textAlign="center" className="Body">
                <Switch>
                    <Route exact path='/' render={() => {
                        return <Redirect to='/news'/>
                    }}/>
                    <Route path='/news' render={(props) => (
                        <NewsCard sub={openIdSub}/>
                    )}/>
                    <Route path='/keyword' render={(props) => (
                        <KeywordCard sub={openIdSub}/>
                    )}/>
                    <Route path="/callback" render={(props) => {
                        handleAuthentication(props);
                        return <Callback {...props} />
                    }}/>
                </Switch>
            </Container>
        );
    }
}

export default Body;