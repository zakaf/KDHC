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
        logLevel: 'dev'
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
        logLevel: 'combined'
    }
};
module.exports = config;