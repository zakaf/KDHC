//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../routes/index');
let should = chai.should();

let request = require("request");

const config = require('../routes/helper/config');
const database = require('../routes/helper/database');

chai.use(chaiHttp);

const testCU = [{urlId: 55, keyword: '테스트키워드1', searchWord: '테스트검색어1'},
    {urlId: 87, keyword: 'fdsafa1263156$', searchWord: 'fdgdsae1263156$'},
    {urlId: 21, keyword: '%#$호아랴', searchWord: '%#$따휴오'},
    {urlId: 521, keyword: '3121fdsakjfdsa', searchWord: '3121yeqwrwe'},
    {urlId: 66, keyword: '하39$#(ㅇ', searchWord: '하39$#21#(ㅇ'}];

const testNews = [{
    newsUrl: 'http://www.naver.com/hi',
    title: '제목1',
    description: '설명1',
    author: '기자1',
    category: '스포츠'
},
    {
        newsUrl: 'http://www.naver.com/hnbvcxvcdi',
        title: '비트코인 폭락',
        description: '안댜재부하어댜',
        author: '기자2',
        category: '경제'
    },
    {
        newsUrl: 'https://www.google.com/h31231i',
        title: '우주 정거장 추락',
        description: 'gdqrn38nfds$(%I#)@',
        author: '기자3',
        category: '우주'
    },
    {
        newsUrl: 'https://www.naver.com/h%#$#@!i',
        title: '쿠테타 발생',
        description: 'fjdsaknvi8024nifdsa',
        author: '기자4',
        category: '사회'
    },
    {
        newsUrl: 'http://www.naver.com/h325r4321i',
        title: '정치적 불안 증가',
        description: 'dnfjkln vgfdw80943n juogfnsd',
        author: '기자5',
        category: '정치'
    }];

function clearDatabase(done) {
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
}

function addKeywordWithNews(clientId, testSetId, done) {
    const cu = testCU[testSetId];
    const news = testNews[testSetId];

    database.pool.query('Insert into client_crawl_ct (url_id, client_id) values (?, ?)', [cu.urlId, clientId], function (err) {
        if (err) return done(err);

        database.pool.query('Insert into crawl_url (url_id, url, keyword, mod_dtime) values (?, ?, ?, now())', [cu.urlId, cu.searchWord, cu.keyword], function (err) {
            if (err) return done(err);

            database.pool.query('Insert into news_crawl_ct (news_url, url_id) values (?, ?)', [news.newsUrl, cu.urlId], function (err) {
                if (err) return done(err);

                database.pool.query('Insert into news (news_url, title, description, pub_date, author, category) values (?, ?, ?, now(), ?, ?)', [news.newsUrl, news.title, news.description, news.author, news.category], function (err) {
                    if (err) return done(err);

                    return done();
                });
            });
        });
    });
}

function addNCT(testCUId, testNewsId, done) {
    const cu = testCU[testCUId];
    const news = testNews[testNewsId];

    database.pool.query('Insert into news_crawl_ct (news_url, url_id) values (?, ?)', [news.newsUrl, cu.urlId], function (err) {
        if (err) return done(err);

        return done();
    });
}

//KDHC Webserver Test
describe('KDHC Webserver', () => {
    let token;
    const clientId = 'sZuKhu3wbV3wQ8XTmA2IOdf6Lw3wKqTN@clients'; //test client id
    const testClientId = 'qwertyuiop'; //client id other than test client id

    before(function (done) {
        //get access token from Auth0
        const options = {
            method: 'POST',
            url: 'https://dongkeunlee.auth0.com/oauth/token',
            headers: {'content-type': 'application/json'},
            body: '{"client_id":"sZuKhu3wbV3wQ8XTmA2IOdf6Lw3wKqTN","client_secret":"pztTrnkAuLXIk0aK1QDtIy6kFNXuCF8OySAoxp_S6y6RDmP1_Hyupkzpfy5Jzys_","audience" : "' + config.auth0.audience + '","grant_type":"client_credentials"}'
        };

        request(options, function (error, response, body) {
            if (error) return done(error);

            token = JSON.parse(body).access_token;

            return done();
        });
    });

    //Test GET, PUT, DELETE for keyword
    describe('/keyword', () => {
        before(function (done) {
            clearDatabase(done);
        });

        // Test the /GET route
        describe('GET /keyword', () => {
            before(function (done) {
                addKeywordWithNews(clientId, 0, done);
            });

            it('it should GET all the keywords', (done) => {
                chai.request(server)
                    .get('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('data');
                        res.body.data.should.have.lengthOf(1);
                        res.body.data[0].should.have.property('keyword').eql(testCU[0].keyword);
                        done();
                    });
            });
        });

        //Test adding keyword
        describe('PUT /keyword', () => {
            before(function (done) {
                addKeywordWithNews(testClientId, 1, done);
            });

            //Test adding an already existing keyword (client_crawl_ct only)
            it('it should PUT a keyword used by another user', (done) => {
                chai.request(server)
                    .put('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: testCU[1].keyword, searchWord: testCU[1].searchWord})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });

            //Test adding a non-existing keyword (client_crawl_ct, crawl_url)
            it('it should PUT a keyword not used by another user', (done) => {
                chai.request(server)
                    .put('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: testCU[2].keyword, searchWord: testCU[2].searchWord})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });
        });

        //Test deleting keyword
        describe('DELETE /keyword (depends on PUT /keyword)', () => {
            before(function (done) {
                //assumes PUT /keyword has been completed successfully, so does not clear
                addKeywordWithNews(clientId, 3, done);
            });

            //Test deleting a keyword with news (client_crawl_ct, crawl_ct, news_crawl_ct, news)
            it('it should DELETE a keyword with news, which is not used by another user ', (done) => {
                chai.request(server)
                    .delete('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: testCU[3].keyword})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });

            //Test deleting a keyword without news (client_crawl_ct, crawl_ct)
            it('it should DELETE a keyword without news, which is not used by another user ', (done) => {
                chai.request(server)
                    .delete('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: testCU[2].keyword})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });

            //Test deleting keyword that other users also have (client_crawl_ct)
            it('it should DELETE a keyword used by another user', (done) => {
                chai.request(server)
                    .delete('/keyword')
                    .set('Authorization', 'Bearer ' + token)
                    .send({keyword: testCU[1].keyword})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        done();
                    });
            });
        });
    });

    //Test /news, /userNews, /keywords, /userKeywords
    describe('/card', () => {
        before(function (done) {
            clearDatabase(done);
        });

        //Test /keywords
        describe('/keywords', () => {
            before(function (done) {
                addKeywordWithNews(testClientId, 0, done);
            });

            it('it should GET all the keywords and news', (done) => {
                chai.request(server)
                    .get('/keywords')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('data');
                        res.body.data.should.have.lengthOf(1);
                        res.body.data[0].should.have.property('news');
                        res.body.data[0].news.should.have.lengthOf(1);
                        done();
                    });
            });
        });

        //Test /userKeywords
        describe('/userKeywords', () => {
            before(function (done) {
                addKeywordWithNews(clientId, 1, done);
            });

            it('it should GET user related keywords and news', (done) => {
                chai.request(server)
                    .get('/userKeywords')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('data');
                        res.body.data.should.have.lengthOf(1);
                        res.body.data[0].should.have.property('news');
                        res.body.data[0].news.should.have.lengthOf(1);
                        done();
                    });
            });
        });

        //Test /news
        describe('/news', () => {
            before(function (done) {
                addNCT(0, 1, done);
            });

            it('it should GET all the news - checks for multiple keyword on one news', (done) => {
                chai.request(server)
                    .get('/news/1')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('data');
                        res.body.data.should.have.lengthOf(2);
                        res.body.data[1].should.have.property('keyword');
                        res.body.data[1].keyword.split(',').should.have.lengthOf(2);
                        done();
                    });
            });
        });

        //Test /userNews
        describe('/userNews', () => {
            it('it should GET user related news', (done) => {
                chai.request(server)
                    .get('/userNews/1')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('data');
                        res.body.data.should.have.lengthOf(1);
                        done();
                    });
            });
        });
    });
});