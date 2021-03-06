import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'semantic-ui-react'
import NewsCard from './card/NewsCard';
import KeywordCard from "./card/KeywordCard";
import ManageKeyword from "./manage/ManageKeyword";
import Callback from "./helper/Callback"
import './css/Body.css';
import PrivacyPolicy from "./manage/PrivacyPolicy";

class Body extends React.Component {
    render() {
        const handleAuthentication = (nextState) => {
            if (/access_token|id_token|error/.test(nextState.location.hash)) {
                this.props.auth.handleAuthentication();
            }
        };

        const openIdSub = this.props.auth.isAuthenticated() ? this.props.auth.getOpenIdSub() : "";
        const idToken = this.props.auth.isAuthenticated() ? this.props.auth.getIdToken() : "";

        return (
            <Container textAlign="center" className="Body">
                <Switch>
                    <Route exact path='/' render={() => {
                        return <Redirect to='/news'/>
                    }}/>
                    <Route path='/news' render={() => (
                        <NewsCard sub={openIdSub} idToken={idToken}/>
                    )}/>
                    <Route path='/keyword' render={() => (
                        <KeywordCard sub={openIdSub} idToken={idToken}/>
                    )}/>
                    <Route path='/manageKeyword' render={() => (
                        <ManageKeyword sub={openIdSub} idToken={idToken}/>
                    )}/>
                    <Route path='/privacyPolicy' render={() => (
                        <PrivacyPolicy/>
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