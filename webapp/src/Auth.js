import React from 'react';
import OktaAuth from '@okta/okta-auth-js';

class Auth {
    constructor() {
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.redirect = this.redirect.bind(this);
        this.getIdToken = this.getIdToken.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
        this.handleAuthentication = this.handleAuthentication.bind(this);

        this.oktaAuth = new OktaAuth({
            url: 'https://{yourOktaDomain}.com',
            clientId: '{clientId}',
            issuer: 'https://{yourOktaDomain}.com/oauth2/default',
            redirectUri: 'http://localhost:3000implicit/callback',
        });
    }

    getIdToken() {
        return this.oktaAuth.tokenManager.get('idToken');
    }

    getAccessToken() {
        // Return the token from the accessToken object.
        return this.oktaAuth.tokenManager.get('accessToken').accessToken;
    }

    login(history) {
        // Redirect to the login page
        history.push('/login');
    }

    async logout(history) {
        this.oktaAuth.tokenManager.clear();
        await this.oktaAuth.signOut();
        history.push('/');
    }

    redirect() {
        // Launches the login redirect.
        this.oktaAuth.token.getWithRedirect({
            responseType: ['id_token', 'token'],
            scopes: ['openid', 'email', 'profile']
        });
    }

    isAuthenticated() {
        // Checks if there is a current accessToken in the TokenManger.
        return !!this.oktaAuth.tokenManager.get('accessToken');
    }

    async handleAuthentication() {
        const tokens = await this.oktaAuth.token.parseFromUrl();
        for (let token of tokens) {
            if (token.idToken) {
                this.oktaAuth.tokenManager.add('idToken', token);
            } else if (token.accessToken) {
                this.oktaAuth.tokenManager.add('accessToken', token);
            }
        }
    }
}

// create a singleton
const auth = new Auth();
export const withAuth = WrappedComponent => props =>
    <WrappedComponent auth={auth} {...props} />;