const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');

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
app.use(morgan('dev'));

//returns top 20 news in the order of published date
app.get('/news', function (req, res) {
    pool.query('SELECT title, description, author, news_url, keyword FROM news inner join crawl_url on news.crawled_url_id = crawl_url.url_id order by pub_date desc limit 20', function (err, rows) {
        if (err)
            throw err;

        res.send(rows)
    });
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

app.listen(config.server.port, function () {
    console.log('webserver listening on port ' + config.server.port)
});
