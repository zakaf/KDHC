const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');
const keyword = require('./keyword');
const database = require('./helper/database');

const env = process.env.NODE_ENV || 'development';
const config = require('../dongkeun.config')[env];

const pageSize = 20; //4의 배수인것이 좋다

const app = express();

app.use(cors());
app.use(morgan(config.logLevel));
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
app.get('/news/:pageNum/:id/', checkJwt, function (req, res) {
    const query = 'SELECT n.title, n.description, n.author, n.news_url, GROUP_CONCAT(cu.keyword SEPARATOR ", ") as keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'where cct.client_id = ? ' +
        'group by n.news_url ' +
        'order by pub_date desc, keyword asc ' +
        'limit ?,?';

    database.pool.query(query, [req.params.id, 0, req.params.pageNum * pageSize], function (err, rows) {
        if (err) {
            console.error(err);
            res.send({});
        }

        res.send(rows)
    });
});

//returns top 20 news in the order of published date
app.get('/news/:pageNum', function (req, res) {
    const query = 'SELECT n.title, n.description, n.author, n.news_url, GROUP_CONCAT(cu.keyword SEPARATOR ", ") as keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'group by n.news_url ' +
        'order by pub_date desc, keyword asc ' +
        'limit ?, ?';

    database.pool.query(query, [0, req.params.pageNum * pageSize], function (err, rows) {
        if (err) {
            console.error(err);
            res.send({});
        }

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
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ';

    database.pool.query(query, [req.params.id], function (err, rows) {
        if (err) {
            console.error(err);
            res.send({});
        }

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            database.pool.query(newsInKeywordQuery, [rows[i].url_id], function (err, newsRows) {
                delete rows[i].url_id;
                rows[i].news = newsRows;
                if (0 === --pending)
                    res.send(rows);
            });
        }
    })
});

//returns top 20 news in the order of published date
//삼성전자 asc
app.get('/keywords', function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ' +
        'limit 20';

    database.pool.query(query, function (err, rows) {
        if (err) {
            console.error(err);
            res.send({});
        }

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            database.pool.query(newsInKeywordQuery, [rows[i].url_id], function (err, newsRows) {
                delete rows[i].url_id;
                rows[i].news = newsRows;
                if (0 === --pending)
                    res.send(rows);
            });
        }
    })
});

//add keyword to the database with id from id_token
app.post('/addKeyword', checkJwt, keyword.addKeyword);

//list keywords according to users
app.get('/listKeyword', checkJwt, keyword.listKeyword);

//delete client_crawl_ct, crawl_url, news, when keyword is deleted
app.post('/deleteKeyword', checkJwt, keyword.deleteKeyword);

app.listen(config.server.port, function () {
    console.log('web server listening on port ' + config.server.port)
});
