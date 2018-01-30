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
    test: {
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
            token: '',
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