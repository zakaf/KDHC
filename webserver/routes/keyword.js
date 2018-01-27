const database = require('./helper/database');
const result = require('./helper/result');
const transaction = require('./helper/transaction');
const urlEncode = require('urlencode');

exports.listKeyword = function (req, res) {
    const selectKeywordQuery = 'SELECT cu.keyword, cu.mod_dtime ' +
        'FROM client_crawl_ct cct ' +
        'inner join crawl_url cu on cct.url_id = cu.url_id ' +
        'where cct.client_id = ? ' +
        'order by cu.mod_dtime desc';

    database.pool.query(selectKeywordQuery, [req.user.sub], function (err, rows) {
        return result.finishRequest(err, res, rows);
    })
};

exports.addKeyword = function (req, res) {
    if (typeof req.body.keyword !== 'string' ||
        typeof req.body.searchWord !== 'string' ||
        req.body.keyword.length === 0 ||
        req.body.searchWord.length === 0)
        return result.finishRequest({code: 'PROPER_INPUT_NEEDED'}, res);

    let url = req.body.searchWord;

    if (req.body.type === 'NAVER')
        url = "http://newssearch.naver.com/search.naver?where=rss&query=" + urlEncode(req.body.searchWord);

    transaction.runTransaction(database.pool, function (conn, next) {
        conn.query('SELECT url_id FROM crawl_url WHERE keyword = ? and url = ?', [req.body.keyword, url], function (err, rows) {
            if (err) return next(err, res);

            const insertCrawlUrlQuery = 'INSERT INTO crawl_url(url, keyword, mod_dtime) VALUES (?, ?, NOW())';
            const insertClientCrawlCtQuery = 'INSERT INTO client_crawl_ct(url_id, client_id) VALUES(?,?)';

            //if no keyword and url combination doesn't exist, insert. If not, get inserted row's id
            if (rows.length === 0)
                conn.query(insertCrawlUrlQuery, [url, req.body.keyword], function (err, crawlUrlResult) {
                    if (err) return next(err, res);

                    conn.query(insertClientCrawlCtQuery, [crawlUrlResult.insertId, req.user.sub], function (err) {
                        return next(err, res);
                    });
                });
            else
                conn.query(insertClientCrawlCtQuery, [rows[0].url_id, req.user.sub], function (err) {
                    return next(err, res);
                });
        });
    }, result.finishRequest);
};

exports.deleteKeyword = function (req, res) {
    if (typeof req.body.keyword !== 'string' ||
        req.body.keyword.length === 0)
        return result.finishRequest({code: 'PROPER_INPUT_NEEDED'}, res);

    transaction.runTransaction(database.pool, function (conn, next) {
        const selectKeywordQuery = 'SELECT crawl_url.url_id FROM client_crawl_ct inner join crawl_url on client_crawl_ct.url_id = crawl_url.url_id where crawl_url.keyword = ? and client_crawl_ct.client_id=?';
        conn.query(selectKeywordQuery, [req.body.keyword, req.user.sub], function (err, result) {
            if (err) return next(err, res);

            if (result.length !== 1)
                return next({code: 'NO_KEYWORD_FOUND'}, res);

            const urlId = result[0].url_id;

            const deleteClientCrawlCtQuery = 'DELETE FROM client_crawl_ct WHERE url_id = ? and client_id = ?';
            conn.query(deleteClientCrawlCtQuery, [urlId, req.user.sub], function (err) {
                if (err) return next(err, res);

                const deleteCrawlUrlQuery = 'DELETE FROM crawl_url WHERE url_id = ? and url_id not in (SELECT url_id FROM client_crawl_ct)';
                conn.query(deleteCrawlUrlQuery, [urlId], function (err) {
                    if (err) return next(err, res);

                    const deleteNewsCrawlCtQuery = 'DELETE FROM news_crawl_ct WHERE url_id = ? and url_id not in (SELECT url_id FROM crawl_url)';
                    conn.query(deleteNewsCrawlCtQuery, [urlId], function (err) {
                        if (err) return next(err, res);

                        const deleteNewsQuery = 'DELETE FROM news WHERE news_url not in (SELECT news_url FROM news_crawl_ct)';
                        conn.query(deleteNewsQuery, [urlId], function (err) {
                            return next(err, res);
                        });
                    });
                });
            });
        });
    }, result.finishRequest);
};