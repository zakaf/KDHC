const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');
const urlencode = require('urlencode');

const env = process.env.NODE_ENV || 'development';
const config = require('../dongkeun.config')[env];

const pool = mysql.createPool({
    host: config.database.host,
    user: config.database.id,
    password: config.database.pw,
    database: config.database.db,
    connectionLimit: 50
});

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Create middleware for checking the JWT
const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dongkeunlee.auth0.com/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: 'mKamlyWKPNCrKow6Lsf3a0DFoT4jXXKe',
    issuer: `https://dongkeunlee.auth0.com/`,
    algorithms: ['RS256']
});

//returns top 20 news of a specific user in the order of published date
app.get('/news/:id', checkJwt, function (req, res) {
    pool.query('SELECT title, description, author, news_url, keyword FROM news inner join crawl_url on news.crawled_url_id = crawl_url.url_id inner join client_crawl_ct on crawl_url.url_id = client_crawl_ct.url_id where client_crawl_ct.client_id = ? order by pub_date desc limit 20', [req.params.id], function (err, rows) {
        if (err)
            throw err;

        res.send(rows)
    });
});

//returns top 20 news in the order of published date
app.get('/news', function (req, res) {
    pool.query('SELECT title, description, author, news_url, keyword FROM news inner join crawl_url on news.crawled_url_id = crawl_url.url_id order by pub_date desc limit 20', function (err, rows) {
        if (err)
            throw err;

        res.send(rows)
    });
});

//returns top 20 news of a specific user in the order of published date
app.get('/keywords/:id', checkJwt, function (req, res) {
    pool.query('SELECT client_crawl_ct.url_id, keyword FROM news inner join crawl_url on news.crawled_url_id = crawl_url.url_id inner join client_crawl_ct on crawl_url.url_id = client_crawl_ct.url_id where client_crawl_ct.client_id = ? group by client_crawl_ct.url_id, keyword order by max(pub_date) desc limit 20', [req.params.id], function (err, rows) {
        if (err)
            throw err;

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            pool.query('SELECT title, description, news_url, pub_date, author FROM news where crawled_url_id = ? order by pub_date desc limit 5', [rows[i].url_id], function (err, newsRows) {
                rows[i].news = newsRows;
                if (0 === --pending)
                    res.send(rows);
            });
        }
    })
});

//returns top 20 news in the order of published date
app.get('/keywords', function (req, res) {
    pool.query('SELECT url_id, keyword FROM news inner join crawl_url on news.crawled_url_id = crawl_url.url_id group by url_id, keyword order by max(pub_date) desc limit 20', function (err, rows) {
        if (err)
            throw err;

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            pool.query('SELECT title, description, news_url, pub_date, author FROM news where crawled_url_id = ? order by pub_date desc limit 5', [rows[i].url_id], function (err, newsRows) {
                rows[i].news = newsRows;
                if (0 === --pending)
                    res.send(rows);
            });
        }
    })
});

//add keyword to the database with id from id_token
//check if keyword exists or not
app.post('/addKeyword', checkJwt, function (req, res) {
    let url = req.body.searchWord;

    if (req.body.type === 'NAVER')
        url = "http://newssearch.naver.com/search.naver?where=rss&query=" + urlencode(req.body.searchWord);

    pool.query('INSERT INTO crawl_url(url, keyword, mod_dtime) VALUES (?, ?, NOW())', [url, req.body.keyword], function (err, crawlUrlResult) {
        if (err)
            throw err;

        pool.query('INSERT INTO client_crawl_ct(url_id, client_id) VALUES(?,?)', [crawlUrlResult.insertId, req.user.sub], function (err, clientCrawlCtResult) {
            if (err)
                throw err;
        });

        res.send({
            keyword: req.body.keyword,
            searchWord: req.body.searchWord
        });
    });
});

//list keywords according to users
app.get('/listKeyword/:id', checkJwt, function (req, res) {
    pool.query('SELECT crawl_url.keyword, crawl_url.mod_dtime FROM client_crawl_ct inner join crawl_url on client_crawl_ct.url_id = crawl_url.url_id where client_crawl_ct.client_id = ? order by mod_dtime desc', [req.params.id], function (err, rows) {
        if (err)
            throw err;
        res.send(rows);
    })
});

app.listen(config.server.port, function () {
    console.log('webserver listening on port ' + config.server.port)
});
