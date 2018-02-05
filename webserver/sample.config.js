const config = {
    development: {
        database: {
            host: '..',
            port: '..',
            db: '..',
            id: '..',
            pw: '..'
        },
        //server details
        server: {
            host: '0.0.0.0',
            port: '..'
        },
        auth0: {
            algorithm: '..',
            audience: '..',
            issuer: '..',
            jwksUri: '..',
        },
        logLevel: 'dev',
        env: 'development'
    },
    localTest: {
        database: {
            host: '..',
            port: '..',
            db: '..',
            id: '..',
            pw: '..'
        },
        //server details
        server: {
            host: '0.0.0.0',
            port: '..'
        },
        auth0: {
            algorithm: '..',
            audience: '..',
            issuer: '..',
            jwksUri: '..',
        },
        logLevel: 'test',
        env: 'test'
    },
    test: {
        database: {
            host: '127.0.0.1',
            port: '3306',
            db: 'kdhcTest',
            id: 'travis',
            pw: ''
        },
        //server details
        server: {
            host: '0.0.0.0',
            port: '3002'
        },
        auth0: {
            algorithm: 'RS256',
            audience: 'https://dongkeunlee.auth0.com/api/v2/',
            issuer: 'https://dongkeunlee.auth0.com/',
            jwksUri: 'https://dongkeunlee.auth0.com/.well-known/jwks.json',
        },
        logLevel: 'test',
        env: 'test'
    },
    production: {
        database: {
            host: '..',
            port: '..',
            db: '..',
            id: '..',
            pw: '..'
        },
        //server details
        server: {
            host: '0.0.0.0',
            port: '..'
        },
        auth0: {
            algorithm: '..',
            audience: '..',
            issuer: '..',
            jwksUri: '..',
        },
        logLevel: 'combined',
        env: 'production'
    }
};
module.exports = config;