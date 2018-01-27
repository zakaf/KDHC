//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../routes/index');
let should = chai.should();

let request = require("request");

const config = require('../routes/helper/config');
const database = require('../routes/helper/database');

chai.use(chaiHttp);

//KDHC Webserver Test
describe('KDHC Webserver', () => {
    let token; //access_token for Auth0
    //const clientId = 'sZuKhu3wbV3wQ8XTmA2IOdf6Lw3wKqTN@clients'; //test client id

    before(function (done) {
        //get access token from Auth0
        const options = {
            method: 'POST',
            url: 'https://dongkeunlee.auth0.com/oauth/token',
            headers: {'content-type': 'application/json'},
            body: '{"client_id":"' + config.auth0.clientId + '","client_secret":"' + config.auth0.clientSecret + '","audience" : "' + config.auth0.audience + '","grant_type":"client_credentials"}'
        };

        request(options, function (error, response, body) {
            if (error) return done(error);

            token = JSON.parse(body).access_token;

            //clear all data from test database
            database.pool.query('DELETE FROM client_crawl_ct', function (err) {
                if (err) return done(err);

                database.pool.query('DELETE FROM crawl_url', function (err) {
                    if (err) return done(err);

                    database.pool.query('DELETE FROM news_crawl_ct', function (err) {
                        if (err) return done(err);

                        database.pool.query('DELETE FROM news', function (err) {
                            if (err) return done(err);

                            return done();
                        });
                    });
                });
            });
        });
    });

    describe('/keyword', () => {
        // Test the /GET route
        describe('GET /keyword', () => {
            it('it should GET all the keywords', (done) => {
                chai.request(server)
                    .get('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });
        });

        //Test normal add (client_crawl_ct, crawl_url) and already existing keyword add (client_crawl_ct only)
        describe('PUT /keyword', () => {
            it('it should PUT a keyword', (done) => {
                chai.request(server)
                    .put('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: '테스트키워드', searchWord: '테스트검색어'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });
        });

        //Test full delete (client_crawl_ct, crawl_ct, news_crawl_ct, news), deleting just added keyword (client_crawl_ct, crawl_ct) and deleting keyword that other users also have (client_crawl_ct)
        describe('DELETE /keyword', () => {
            it('it should DELETE a keyword', (done) => {
                chai.request(server)
                    .delete('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: '테스트키워드'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });
        });
    });

});