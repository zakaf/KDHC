//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../routes/index');
let should = chai.should();

let request = require("request");

chai.use(chaiHttp);

//Our parent block
describe('Keyword', () => {
    let token; //access_token for Auth0

    before(function (done) {
        var options = {
            method: 'POST',
            url: 'https://dongkeunlee.auth0.com/oauth/token',
            headers: {'content-type': 'application/json'},
            body: '{"client_id":"sZuKhu3wbV3wQ8XTmA2IOdf6Lw3wKqTN","client_secret":"pztTrnkAuLXIk0aK1QDtIy6kFNXuCF8OySAoxp_S6y6RDmP1_Hyupkzpfy5Jzys_","audience":"https://dongkeunlee.auth0.com/api/v2/","grant_type":"client_credentials"}'
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
                .end((err, res) => {
                    console.log(token);
                    res.should.have.status(200);
                    done();
                });
        });
    });

});