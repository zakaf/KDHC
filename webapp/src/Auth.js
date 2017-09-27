import auth0 from 'auth0-js';
import config from './config/config'

export default class Auth {
    auth0 = new auth0.WebAuth({
        domain: config.config.authUrl,
        clientID: config.config.authClientId,
        redirectUri: config.config.redirectUrl,
        audience: config.config.audience,
        responseType: 'token id_token',
        scope: 'openid'
    });

    login() {
        this.auth0.authorize();
    }
}