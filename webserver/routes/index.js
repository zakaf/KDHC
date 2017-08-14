const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');

const env = process.env.NODE_ENV || 'development';
const config = require('../dongkeun.config')[env];

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.id,
    password: config.database.pw,
    database: config.database.db
});

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.get('/news', function (req, res) {
    connection.query('SELECT * FROM news inner join crawl_url on news.crawled_url_id = crawl_url.url_id order by pub_date desc limit 20 offset 20', function (err, rows) {
        if (err)
            throw err;

        res.send(rows)
    })
});

app.listen(config.server.port, function () {
    console.log('webserver listening on port ' + config.server.port)
});
