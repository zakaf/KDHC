const config = require('./config');
const redis = require('redis');

//redis connectable ip is configured by EC2 inbound rules as redis binds to all ip
module.exports = Object.freeze({
    client: redis.createClient(config.redis.port, config.redis.host),
    pushJSONArrayAsList: function (key, array, initializeBeforePush) {
        let client = this.client;

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
});