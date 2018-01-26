//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../routes/index');
let should = chai.should();

let request = require("request");

const config = require('../routes/helper/config');

chai.use(chaiHttp);

//Our parent block
describe('Keyword', () => {
    let token; //access_token for Auth0

    before(function (done) {
        const options = {
            method: 'POST',
            url: 'https://dongkeunlee.auth0.com/oauth/token',
            headers: {'content-type': 'application/json'},
            body: '{"client_id":"' + config.auth0.clientId + '","client_secret":"' + config.auth0.clientSecret + '","audience" : "' + config.auth0.audience + '","grant_type":"client_credentials"}'
        };

        request(options, function (error, response, body) {
            if (error) return done(error);

            token = JSON.parse(body).access_token;

            return done();
        });
    });

    /*
      * Test the /GET route
      */
    describe('/GET keyword', () => {
        it('it should GET all the keywords', (done) => {
            chai.request(server)
                .get('/keyword')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

});