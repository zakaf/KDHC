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
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlFUTkROamt6TnpnM09ERXhOelV3TnpJeE4wVTNNREkzT1VZMk5UY3hNVUV3UXprME1rSkJSUSJ9.eyJpc3MiOiJodHRwczovL2RvbmdrZXVubGVlLmF1dGgwLmNvbS8iLCJzdWIiOiJzWnVLaHUzd2JWM3dROFhUbUEySU9kZjZMdzN3S3FUTkBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kb25na2V1bmxlZS5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTUxNzMwNDg4NiwiZXhwIjoxNTE3MzkxMjg2LCJhenAiOiJzWnVLaHUzd2JWM3dROFhUbUEySU9kZjZMdzN3S3FUTiIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.F3RoJxuGURnuKwpFi7lDN2ViOfJE-kYQ9z6H9Ye0RtSgTkleATJCiHwhbBV_zJ1jxcY_U0UruUsgliKHP_hJE5z986fLxvUN-6Uu8oVqbG96b25OnlWSKKK-uXdjMLLnyu6s8FHKL1BiTEaeEij945hlX6tXvdIBbhmEoOQQhTPDPJ2RZR7Bn-LgYtKC5zFr0UlAfWYsWSyjsSJdEzsh6GA3APWEBapUPqrGZWBd-vxt8rcyN0s0zSVERE-jBDaHpV-SwjRZcBUZHWGUOpqjqPhT-XTKassTE2c1-oOV4D-YEt71jXfQawEoJqsr5AQQ74z3r5_UPPXiQhqTPeSupQ'
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