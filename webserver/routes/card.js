const database = require('./helper/database');
const redis = require('./helper/redis');
const result = require('./helper/result');

const keywordCardCacheKeyIdentifier = 'keyword:';
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

exports.listKeywordNews = function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ' +
        'limit 20';

    database.pool.query(query, function (err, keywordRows) {
        if (err) return result.finishRequest(err, res);

        let pending = keywordRows.length;

        if (keywordRows.length === 0)
            return result.finishRequest(err, res, keywordRows);

        for (let i = 0; i < keywordRows.length; i++) {
            let cacheKey = keywordCardCacheKeyIdentifier + keywordRows[i].url_id;

            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            let params = [keywordRows[i].url_id];

            redis.retrieveDataFromCacheOrDatabase(cacheKey, newsInKeywordQuery, params, function (err, newsRows) {
                delete keywordRows[i].url_id;
                keywordRows[i].news = newsRows;

                if (0 === --pending)
                    result.finishRequest(err, res, keywordRows);
            });
        }
    });
};

exports.listKeywordNewsWithId = function (req, res) {
    const query = 'SELECT cct.url_id, cu.keyword ' +
        'FROM news n ' +
        'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
        'inner join crawl_url cu on nct.url_id = cu.url_id ' +
        'inner join client_crawl_ct cct on cu.url_id = cct.url_id ' +
        'where cct.client_id = ? ' +
        'group by cu.url_id, cu.keyword ' +
        'order by GROUP_CONCAT(pub_date SEPARATOR ", ") desc, cu.keyword asc ';

    database.pool.query(query, [req.user.sub], function (err, keywordRows) {
        if (err) return result.finishRequest(err, res);

        let pending = keywordRows.length;

        if (keywordRows.length === 0)
            return result.finishRequest(err, res, keywordRows);

        for (let i = 0; i < keywordRows.length; i++) {
            let cacheKey = keywordCardCacheKeyIdentifier + keywordRows[i].url_id;

            const newsInKeywordQuery = 'SELECT n.title, n.news_url, n.pub_date, n.author ' +
                'FROM news n ' +
                'inner join news_crawl_ct nct on n.news_url = nct.news_url ' +
                'where nct.url_id = ? ' +
                'order by n.pub_date desc ' +
                'limit 5';

            let params = [keywordRows[i].url_id];

            redis.retrieveDataFromCacheOrDatabase(cacheKey, newsInKeywordQuery, params, function (err, newsRows) {
                delete keywordRows[i].url_id;
                keywordRows[i].news = newsRows;

                if (0 === --pending)
                    return result.finishRequest(err, res, keywordRows);
            });
        }
    });
};