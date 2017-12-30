const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');
const urlEncode = require('urlencode');

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
    const query = 'SELECT n.title, n.description, n.author, n.news_url, GROUP_CONCAT(cu.keyword SEPARATOR ", ") as keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'where cct.client_id = ? ' +
        'group by n.title, n.description, n.author, n.news_url ' +
        'order by pub_date desc ' +
        'limit 20';

    pool.query(query, [req.params.id], function (err, rows) {
        if (err)
            throw err;

        res.send(rows)
    });
});

//returns top 20 news in the order of published date
app.get('/news', function (req, res) {
    const query = 'SELECT n.title, n.description, n.author, n.news_url, GROUP_CONCAT(cu.keyword SEPARATOR ", ") as keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'group by n.title, n.description, n.author, n.news_url ' +
        'order by pub_date desc ' +
        'limit 20';

    pool.query(query, function (err, rows) {
        if (err)
            throw err;

        res.send(rows)
    });
});

//returns top 20 news of a specific user in the order of published date
app.get('/keywords/:id', checkJwt, function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'where cct.client_id = ? ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ' +
        'limit 20';

    pool.query(query, [req.params.id], function (err, rows) {
        if (err)
            throw err;

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            pool.query(newsInKeywordQuery, [rows[i].url_id], function (err, newsRows) {
                delete rows[i].url_id;
                rows[i].news = newsRows;
                if (0 === --pending)
                    res.send(rows);
            });
        }
    })
});

//returns top 20 news in the order of published date
app.get('/keywords', function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ' +
        'limit 20';

    pool.query(query, function (err, rows) {
        if (err)
            throw err;

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            pool.query(newsInKeywordQuery, [rows[i].url_id], function (err, newsRows) {
                delete rows[i].url_id;
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
        url = "http://newssearch.naver.com/search.naver?where=rss&query=" + urlEncode(req.body.searchWord);

    pool.query('INSERT INTO crawl_url(url, keyword, mod_dtime) VALUES (?, ?, NOW())', [url, req.body.keyword], function (err, crawlUrlResult) {
        if (err)
            throw err;

        pool.query('INSERT INTO client_crawl_ct(url_id, client_id) VALUES(?,?)', [crawlUrlResult.insertId, req.user.sub], function (err) {
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
app.get('/listKeyword', checkJwt, function (req, res) {
    pool.query('SELECT crawl_url.keyword, crawl_url.mod_dtime FROM client_crawl_ct inner join crawl_url on client_crawl_ct.url_id = crawl_url.url_id where client_crawl_ct.client_id = ? order by mod_dtime desc', [req.user.sub], function (err, rows) {
        if (err)
            throw err;
        res.send(rows);
    })
});

//delete client_crawl_ct, crawl_url, news, when keyword is deleted
app.post('/deleteKeyword', checkJwt, function (req, res) {
    pool.query('SELECT crawl_url.url_id FROM client_crawl_ct inner join crawl_url on client_crawl_ct.url_id = crawl_url.url_id where crawl_url.keyword = ? and client_crawl_ct.client_id=?',
        [req.body.keyword, req.user.sub],
        function (err, crawlUrlResult) {
            if (err)
                throw err;

            if (crawlUrlResult.length !== 1)
                throw "No keyword found";

            let urlId = crawlUrlResult[0].url_id;

            pool.query('DELETE FROM client_crawl_ct where url_id = ? and client_id = ?', [urlId, req.user.sub], function (err) {
                if (err)
                    throw err;
            });

            pool.query('DELETE FROM crawl_url where url_id = ?', [urlId], function (err) {
                if (err)
                    throw err;
            });

            pool.query('DELETE FROM news where crawled_url_id = ?', [urlId], function (err) {
                if (err)
                    throw err;
            });

            res.send({
                keyword: req.body.keyword
            });
        })
    ;
});

app.listen(config.server.port, function () {
    console.log('web server listening on port ' + config.server.port)
});
