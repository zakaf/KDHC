const config = require('./config');
const database = require('./database');
const redis = require('redis');

//redis connectable ip is configured by EC2 inbound rules as redis binds to all ip
module.exports = {
    client: redis.createClient(config.redis.port, config.redis.host),
    pushJSONArrayAsList: function (key, array, initializeBeforePush) {
        let client = module.exports.client;

        if (initializeBeforePush)
            client.del(key);

        let multi = client.multi();

        array.forEach(function (element) {
            multi.rpush(key, JSON.stringify(element));
        });

        multi.exec(function (err) {
            if (err)
                client.del(key);
        });
    },
    retrieveDataFromCacheOrDatabase: function (key, query, params, finishFunc) {
        let client = this.client;

        client.llen(key, function (err, cacheLength) {
            if (!err && cacheLength !== 0) {
                // 0, -1 returns all elements in the list
                client.lrange(key, 0, -1, function (err, rows) {
                    for (let i = 0; i < rows.length; i++)
                        rows[i] = JSON.parse(rows[i]);

                    finishFunc(err, rows);
                });
            } else {
                database.pool.query(query, params, function (err, rows) {
                    if (!err)
                        module.exports.pushJSONArrayAsList(key, rows, true);

                    finishFunc(err, rows);
                });
            }
        });
    },
};