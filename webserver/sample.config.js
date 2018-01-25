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
        logLevel: 'combined',
        env: 'production'
    }
};
module.exports = config;