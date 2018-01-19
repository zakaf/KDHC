const database = require('./helper/database');
const result = require('./helper/result');

const pageSize = 20; //4의 배수인것이 좋다

exports.listNews = function (req, res) {
    const query = 'SELECT n.title, n.description, n.author, n.news_url, GROUP_CONCAT(cu.keyword SEPARATOR ", ") as keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'group by n.news_url ' +
        'order by pub_date desc, keyword asc ' +
        'limit ?, ?';

    database.pool.query(query, [0, req.params.pageNum * pageSize], function (err, rows) {
        return result.finishRequest(err, res, rows);
    });
};

exports.listNewsWithId = function (req, res) {
    const query = 'SELECT n.title, n.description, n.author, n.news_url, GROUP_CONCAT(cu.keyword SEPARATOR ", ") as keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'where cct.client_id = ? ' +
        'group by n.news_url ' +
        'order by pub_date desc, keyword asc ' +
        'limit ?,?';

    database.pool.query(query, [req.user.sub, 0, req.params.pageNum * pageSize], function (err, rows) {
        return result.finishRequest(err, res, rows);
    });
};

exports.listKeywords = function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ' +
        'limit 20';

    database.pool.query(query, function (err, rows) {
        if (err) return result.finishRequest(err, res);

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            database.pool.query(newsInKeywordQuery, [rows[i].url_id], function (err, newsRows) {
                if (err) return result.finishRequest(err, res);

                delete rows[i].url_id;
                rows[i].news = newsRows;

                if (0 === --pending)
                    result.finishRequest(err, res, rows);
            });
        }
    });
};

exports.listKeywordsWithId = function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'where cct.client_id = ? ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ';

    database.pool.query(query, [req.user.sub], function (err, rows) {
        if (err) return result.finishRequest(err, res);

        let pending = rows.length;

        for (let i = 0; i < rows.length; i++) {
            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            database.pool.query(newsInKeywordQuery, [rows[i].url_id], function (err, newsRows) {
                if (err) return result.finishRequest(err, res);

                delete rows[i].url_id;
                rows[i].news = newsRows;

                //when all the query is done, send the result. Queries are not necessarily done in order in which they started
                if (0 === --pending)
                    return result.finishRequest(err, res, rows);
            });
        }
    });
};