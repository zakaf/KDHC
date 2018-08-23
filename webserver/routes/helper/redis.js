const config = require('./config');
const redis = require('redis');

//redis connectable ip is configured by EC2 inbound rules as redis binds to all ip
module.exports = Object.freeze({
    client: redis.createClient(config.redis.port, config.redis.host),
});