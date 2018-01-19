const config = {
    development: {
        serverUrl: 'http://localhost:3001',
        authClientId: '***',
        authUrl: '***.auth0.com',
        redirectUrl: 'http://localhost:3000/callback',
        audience: 'https://***.auth0.com/userinfo',
        refreshInterval: 5000,
    },
    production: {
        serverUrl: '',
        authClientId: '',
        authUrl: '',
        redirectUrl: '',
        audience: '',
        refreshInterval: 10000,
    }
};

module.exports = {
    config: config
};